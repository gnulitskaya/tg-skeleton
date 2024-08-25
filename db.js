import pkg from 'pg';
const Pool = pkg.Pool;

const pool = new Pool({
    user: 'apptguser',
    host: 'localhost',
    database: 'apptguser',
    password: 'Pa13838w0rd',
    port: 5432,
});

async function createTable() {
    try {
        await client.connect();
        console.log('Connected to PostgreSQL database!');

        // Проверка существования таблицы
        // const res = await client.query(`
        //     SELECT EXISTS (
        //         SELECT 1
        //         FROM information_schema.tables
        //         WHERE table_name = 'users'
        //     );
        // `);

        // if (!res.rows[0].exists) {
        //     // Создание таблицы, если она не существует
        //     await client.query(`
        //         CREATE TABLE users (
        //             id SERIAL PRIMARY KEY,
        //             name VARCHAR(100) NOT NULL,
        //             email VARCHAR(100) UNIQUE NOT NULL,
        //             created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        //         );
        //     `);
        //     console.log('Table created successfully!');
        // } else {
        //     console.log('Table "users" already exists.');
        // }
    } catch (err) {
        console.error('Error creating table:', err);
    } finally {
        // Закрытие клиента после завершения всех операций
        await client.end();
        console.log('Connection to PostgreSQL closed');
    }
}

// Вызов функции для создания таблицы
// createTable();

export default pool;