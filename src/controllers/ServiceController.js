import { getConnection } from "../utils";

const all = async (req, res) => {
    const connection = await getConnection();
    const userQuery = `
        SELECT *, users.avatar_path as user_avatar_path FROM services
        JOIN users ON (users.id = owner_id)
    `;
    const [ result ] = await connection.execute(userQuery);
    const services = result.map(item => ({
        id: item.id,
        number: item.number,
        description: item.description,
        avatar_path: item.avatar_path,
        owner: {
            id: item.id,
            name: item.name,
            email: item.email,
            avatar_path: item.user_avatar_path,
        },
    }));

    res.json(services);
};

const create = async (req, res) => {
    const user = req.user;
    const params = req.body;
    const number = params.number;
    const description = params.description;
    const avatar_path = params.avatar_path !== '' ? params.avatar_path : null;

    if ( !number || !description ) return req.sendStatus(403);

    const connection = await getConnection();
    const query = `
        INSERT INTO services
        (owner_id, number, description, avatar_path)
        VALUES (?, ?, ?, ?)
    `;
    await connection.execute(query, [
        user,
        number,
        description,
        avatar_path,
    ]);

    res.end();
};

const update = async (req, res) => {
    const id = req.params.id;
    const user = req.user;
    const params = req.body;
    const number = params.number;
    const description = params.description;
    const avatar_path = params.avatar_path;

    if ( !avatar_path ) avatar_path = null;
    if ( !number || !description ) return req.sendStatus(403);

    const connection = await getConnection();
    const query = `
        UPDATE services
        SET number = ?, description = ?, avatar_path = ?
        WHERE id = ? AND owner_id = ?
    `;
    await connection.execute(query, [
        number,
        description,
        avatar_path,
        id,
        user,
    ]);

    res.end();
};

const remove = async (req, res) => {
    const user = req.user;
    const serviceId = req.params.id;

    const connection = await getConnection();
    const query = `
        DELETE FROM services
        WHERE id = ? AND owner_id = ?
    `;
    await connection.execute(query, [ serviceId, user ]);

    res.end();
};

export default {
    all,
    create,
    update,
    remove,
};