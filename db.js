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
            status VARCHAR(20) NOT NULL,
            full_name VARCHAR(100) NOT NULL,
            telegram_nick VARCHAR(100) NOT NULL,
            amount INT NOT NULL,
            currency VARCHAR(10) NOT NULL,
            order_id TEXT NOT NULL,
            comment TEXT,
            adress TEXT,
            payment_method VARCHAR(20) NOT NULL,
            chat_id INT NOT NULL,
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