import { getConnection } from '../utils';

const connection = await getConnection();

const create_users_table = async () => {
    await connection.query(`
        CREATE TABLE users(
            id INT NOT NULL AUTO_INCREMENT,
            name VARCHAR(255) NOT NULL,
            email VARCHAR(255) NOT NULL UNIQUE,
            password VARCHAR(255) NOT NULL, 
            avatar_path VARCHAR(255),
            PRIMARY KEY(id)
        )
    `);
};

const drop_users_table = async () => {
    await connection.query(`DROP TABLE IF EXISTS users`);
};

const create_services_table = async () => {
    await connection.query(`
        CREATE TABLE services(
            id INT NOT NULL AUTO_INCREMENT,
            owner_id INT NOT NULL,
            number VARCHAR(255) NOT NULL,
            avatar_path VARCHAR(255),
            description VARCHAR(510) NOT NULL,
            PRIMARY KEY(id),
            FOREIGN KEY(owner_id) REFERENCES users(id)
        )
    `);
};

const drop_services_table = async () => {
    await connection.query(`DROP TABLE IF EXISTS services`);
};

await drop_services_table();
await drop_users_table();

await create_users_table();
await create_services_table();

connection.end();