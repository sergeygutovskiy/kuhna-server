import jsonwebtoken from 'jsonwebtoken';
import { getConnection } from '../utils';

const login = async (req, res) => {
    const params = req.body;
    const email = params.email;
    const password = params.password;

    if ( !email || !password ) return res.sendStatus(403);

    const connection = await getConnection();
    const query = `
        SELECT * FROM users
        WHERE email = ? AND password = ?
        LIMIT 1
    `;
    const [ result ] = await connection.execute(query, [ email, password ]);

    if ( result.length === 0 ) return res.sendStatus(403);

    const user = result[0];
    
    if ( user.password !== password ) return res.sendStatus(403);

    const token = jsonwebtoken.sign(
        { data: user.id }, 
        'secret', 
        { expiresIn: '24h' }
    );

    res.json({
        token: token,
        id: user.id,
    });
};

const register = async (req, res) => {
    const params = req.body;
    const name = params.name;
    const email = params.email;
    const password = params.password;

    if ( !name || !email || !password ) return res.sendStatus(403);

    const connection = await getConnection();
    const query = `
        INSERT INTO users
        (name, email, password)
        VALUES (?, ?, ?)
    `;
    const [ result ] = await connection.execute(query, [
        name,
        email,
        password,
    ]);

    const token = jsonwebtoken.sign(
        { data: result.insertId }, 
        'secret', 
        { expiresIn: '24h' }
    );

    res.json({
        token: token,
        id: result.insertId,
    });
};

const update = async (req, res) => {
    const id = req.user;
    const params = req.body;
    const name = params.name;
    const email = params.email;
    const avatarPath = params.avatar_path !== '' ? params.avatar_path : null;

    if ( !name || !email ) return res.sendStatus(403);

    const connection = await getConnection();
    const query = `
        UPDATE users
        SET name = ?, email = ?, avatar_path = ?
        WHERE id = ?
    `;
    await connection.execute(query, [
        name,
        email,
        avatarPath,
        id,
    ]);

    res.end();
};

const account = async (req, res) => {
    const connection = await getConnection();
    const query = `
        SELECT * FROM users
        WHERE id = ?
        LIMIT 1
    `;
    const [ result ] = await connection.execute(query, [ req.user ]);

    if ( result.length === 0 ) return res.sendStatus(403);

    return res.json(result[0]);
};

const accountServices = async (req, res) => {
    const connection = await getConnection();
    const userQuery = `
        SELECT * FROM users
        WHERE id = ?
        LIMIT 1
    `;
    const [ userResult ] = await connection.execute(userQuery, [ req.user ]);
    if ( userResult.length === 0 ) return res.sendStatus(403);

    const user = userResult[0];
    
    const servicesQuery = `
        SELECT * FROM services
        WHERE owner_id = ?
    `;
    const [ servicesResult ] = await connection.execute(servicesQuery, [ req.user ]);
    const services = servicesResult.map(service => ({ ...service, owner: user, }));

    return res.json(services);
};

export default {
    login,
    register,
    update,
    account,
    accountServices,
};