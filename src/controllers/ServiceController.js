import { getConnection } from "../utils";

const all = async (req, res) => {
    const connection = await getConnection();
    const userQuery = `
        SELECT 
            services.id, services.number, services.owner_id,
            services.description, services.avatar_path,

            users.name as owner_name,
            users.email as owner_email,
            users.avatar_path as owner_avatar_path
        FROM services
        JOIN users ON (users.id = owner_id)
    `;
    const [ result ] = await connection.execute(userQuery);
    const services = result.map(item => ({
        id: item.id,
        number: item.number,
        description: item.description,
        avatar_path: item.avatar_path,
        owner: {
            id: item.owner_id,
            name: item.owner_name,
            email: item.owner_email,
            avatar_path: item.owner_avatar_path,
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
    const params = req.body;
    const number = params.number;
    const description = params.description;
    const avatar_path = params.avatar_path !== '' ? params.avatar_path : null;

    console.log(avatar_path);

    if ( !number || !description ) return req.sendStatus(403);

    const connection = await getConnection();
    const query = `
        UPDATE IGNORE services
        SET number = ?, description = ?, avatar_path = ?
        WHERE id = ?
    `;
    await connection.execute(query, [
        number,
        description,
        avatar_path,
        id
    ]);

    res.end();
};

const remove = async (req, res) => {
    const user = req.user;
    const serviceId = req.params.id;

    const connection = await getConnection();
    const query = `
        DELETE FROM services
        WHERE id = ?
    `;
    await connection.execute(query, [ serviceId ]);

    res.end();
};

export default {
    all,
    create,
    update,
    remove,
};