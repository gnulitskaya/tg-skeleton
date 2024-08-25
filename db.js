import pkg from 'pg';
const Pool = pkg.Pool;

const pool = new Pool({
    user: 'apptguser',
    host: 'localhost',
    database: 'apptguser',
    password: 'Pa13838w0rd',
    port: 5432,
});

// Функция для создания таблицы
async function createTableIfNotExists() {
    const createTableQuery = `
        CREATE TABLE IF NOT EXISTS users (
            id SERIAL PRIMARY KEY,
            name VARCHAR(100) NOT NULL,
            email VARCHAR(100) UNIQUE NOT NULL,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
    `;

    try {
        const client = await pool.connect();
        await client.query(createTableQuery);
        console.log("Таблица успешно создана или уже существует.");
    } catch (err) {
        console.error("Ошибка при создании таблицы:", err);
    } finally {
        // pool.end(); // Закрываем соединение с пулом
    }
}

// Вызов функции
createTableIfNotExists();

export default pool;