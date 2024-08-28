import db from '../db.js';
import createPayment from '../scripts/create-payment.js';

class UserController {
    static confirmationUrl = '';
    getConfirmationUrl() {
        return UserController.confirmationUrl;
    }
    async savePaymentWebApp(req, res) {
        console.log('savePaymentWebApp', req.body);
        const { price, form, products, chatId, orderId, telegramNick } = req.body;

        try {
            const payment = await createPayment(price, chatId, orderId, 'https://tgminiapp-ee5d4.web.app/confirm');

            const paymentData = {
                price,
                form,
                products,
                chatId,
                orderId,
                telegramNick
            };

            // Сохраните данные о платеже, если это необходимо
            console.log('jhdsbcjhdsbchdjc');
            await UserController.savePayment({
                status: 'createPayment',
                full_name: form?.fullName,
                telegram_nick: telegramNick,
                products: products,
                amount: price,
                currency: 'RUB',
                order_id: orderId,
                comment: form?.comment,
                address: form?.address,
                payment_method: form?.paymentMethod,
                chat_id: chatId,
            });

            UserController.confirmationUrl = payment.confirmation.confirmation_url; // Use this to assign the value

            return res.json(paymentData); // Возвращаем данные о платеже
        } catch (err) {
            console.error(err);
            return res.status(500).json({ error: 'Ошибка при создании платежа' });
        }
    }
    async savePayment(req, res) {
        console.log('newUser', req);
        // const { status, full_name, telegram_nick, amount, currency, order_id, comment, address, payment_method, chat_id } = req;

        const newUser = await db.query('INSERT INTO payments (status, full_name, telegram_nick, products, amount, currency, order_id, comment, address, payment_method, chat_id) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11) RETURNING *',
            [req.status, req.full_name, req.telegram_nick, req.products, req.amount, req.currency, req.order_id, req.comment, req.address, req.payment_method, req.chat_id]);

        // res.json(newUser.rows[0]);
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
        // const { order_id, status } = req;
        const payment = await db.query('UPDATE payments SET status = $2 WHERE order_id = $1 RETURNING *',
            [req.order_id, req.status]);
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