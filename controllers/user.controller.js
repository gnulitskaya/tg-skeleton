import db from '../db.js';

class UserController {
    async createUser(req, res) {
        // const newUser = await db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
        console.log('newUser', req);
        const newUser = await db.query('INSERT INTO users (status, full_name, telegram_nick, amount, currency, order_id, comment, adress, payment_method, chat_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *', 
            [req.body.status, req.body.full_name, req.body.telegram_nick, req.body.amount, req.body.currency, req.body.order_id, req.body.comment, req.body.adress, req.body.payment_method, req.body.chat_id]);

        res.status(201).json(newUser.rows[0]);
        // res.json(newUser.rows[0])
    }
    async getUsers(req, res) {

    }
    async getOneUser(req, res) {

    }
    async updateUser(req, res) {

    }
    async deleteUser(req, res) {

    }
}

// module.exports = 
export default new UserController();