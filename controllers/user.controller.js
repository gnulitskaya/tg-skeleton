import db from '../db.js';

class UserController {
    async createUser(req, res) {
        const {name, email} = req.body;
        const newUser = await db.query('INSERT INTO users (name, email) VALUES ($1, $2) RETURNING *', [name, email]);
        // console.log(newUser);
        res.json(newUser.rows[0])
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