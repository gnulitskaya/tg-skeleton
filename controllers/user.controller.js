import db from '../db.js';

class UserController {
    async createPayment(req, res) {
        console.log('newUser', req);
        // const { status, full_name, telegram_nick, amount, currency, order_id, comment, adress, payment_method, chat_id } = req;

        const newUser = await db.query('INSERT INTO payments (status, full_name, telegram_nick, amount, currency, order_id, comment, adress, payment_method, chat_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', 
            [req.status, req.full_name, req.telegram_nick, req.amount, req.currency, req.order_id, req.comment, req.adress, req.payment_method, req.chat_id]);

        res.status(201).json(newUser.rows[0]);
    }
    async getAllPayments(req, res) {
        const allPayments = await db.query('SELECT * FROM payments');
        res.json(allPayments.rows);
    }
    async getOnePayment(req, res) {
        const orderId = req.params.id;
        const payment = await db.query('SELECT * FROM payments WHERE id = $1', [orderId]);
        return res.json(payment.rows[0]);
    }
    async updatePayment(req, res) {
        console.log('updatePayment', req);
        const { status, full_name, telegram_nick, amount, currency, order_id, comment, adress, payment_method, chat_id, id } = req;
        const payment = await db.query('UPDATE payments SET status = $1, full_name = $2, telegram_nick = $3, amount = $4, currency = $5, order_id = $6, comment = $7, adress = $8, payment_method = $9, chat_id = $10 WHERE id = $11 RETURNING *',
            [status, full_name, telegram_nick, amount, currency, order_id, comment, adress, payment_method, chat_id, id]);
        return res.json(payment.rows[0]);
    }
    async deletePayment(req, res) {
        const id = req.params.id;
        const payment = await db.query('DELETE FROM payments WHERE id = $1', [id]);
        return res.json(payment.rows[0]);
    }
}

// module.exports = 
export default new UserController();