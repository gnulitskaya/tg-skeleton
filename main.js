import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import express from 'express';
import cors from 'cors';
import https from 'https';
import fs from 'fs';
import userController from './controllers/user.controller.js';
import createPayment from './scripts/create-payment.js';
import router from './routes/user.routes.js';
import mockText from './scripts/mock.js';

var corsOptions = {
    origin: ['https://tgmini.ru', 'https://tgminiapp-ee5d4.web.app', 'https://api.yookassa.ru/v3/payments'],
    methods: ['GET','POST','PUT','DELETE','PATCH'], // разрешенные методы
    credentials: true, // Разрешает использование учетных данных (куки, авторизация и т.д.)
    optionsSuccessStatus: 200
};

const app = express();
app.use(cors(corsOptions));
app.use(express.json())

const PORT = process.env.PORT || 8443;
const token = '7478645760:AAFZTKbydXzv6eGfFD8J1y-ekpGV8RCXDDw';
const webAppUrl = 'https://tgminiapp-ee5d4.web.app/';
const bot = new Telegraf(token);
let confirmationUrl = '';

bot.command('start', (ctx) => {
    ctx.reply(mockText.start,
        Markup.keyboard([Markup.button.webApp('👉 Каталог', webAppUrl)])
    )
    // ctx.replyWithPhoto({ source: './product1.jpeg' });
})

bot.on(message('web_app_data'), async (ctx) => {
    const data = ctx.webAppData.data.json();
    const chatId = ctx.message.chat.id;
    const orderId = Math.random().toString(36).substring(7);
    console.log('DATA', data);
    const products = JSON.stringify(data?.products);

    const price = data?.price;
    const fullName = data?.form.fullName || 'Уважаемый клиент';
    const telegramNick = '@' + ctx.message.chat.username || 'не указан';
    const email = data?.form.email || 'не указан';
    const phone = data?.form.phone || 'не указан';
    const comment = data?.form.comment || 'Нет комментариев';
    const address = data?.form.address || 'Не указан';
    const city = data?.form.city || 'Не указан';
    const postalCode = data?.form.postalCode || 'Не указан';
    const paymentMethod = data?.form.paymentMethod || 'Не указан';

    if (price) {
        await createPayment(price, chatId, orderId)
            .then(payment => {
                const paymentData = {
                    price: price,
                    form: data?.form,
                    products,
                    chatId,
                    orderId,
                    telegramNick
                }
                savePayment(paymentData, 'createPayment');
                confirmationUrl = `${payment.confirmation.confirmation_url}`;

                const keyboard = Markup.inlineKeyboard([
                    [Markup.button.url('Оплатить 🥳', confirmationUrl)]
                ]);

                ctx.reply(`
Уважаемый(ая) ${fullName}
Платеж создан, ссылка для оплаты: ${confirmationUrl}

Вот детали вашей покупки:

- Товары: ${JSON.parse(products).map(item => {
    const { name, price } = item.product;
    const quantity = item.quantity;
    return `${name} - ${price}, ${quantity} шт.`;
}).join(', ')}

- Полное имя: ${fullName}
- Ник в Телеграме: ${telegramNick}
- Email: ${email}
- Телефон: ${phone}
- Адрес: ${address}, ${city}, ${postalCode}
- Метод оплаты: ${paymentMethod}
- Комментарий: ${comment}

${mockText.help}`,keyboard);
            })
            .catch(err => {
                console.error(err);
                ctx.reply('Произошла ошибка при создании платежа.');
            });
    } else {
        ctx.reply('Не удалось получить цену заказа.');
    }
})

app.get('/events', (req, res) => {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send an event every second
    const intervalId = setInterval(() => {
        console.log('-----', userController.getConfirmationUrl());
        const data = { link: userController.getConfirmationUrl(), timestamp: new Date() };
        res.write(`data: ${JSON.stringify(data)}\n\n`);
    }, 1000);

    req.on('close', () => {
        clearInterval(intervalId);
        // confirmationUrl = '';
        res.end();
    });
});

app.post('/webhook', async (req, res) => {
    const eventData = req.body;
    console.log('eventData', eventData);

    if (eventData?.event === 'payment.succeeded') {
        // const paymentId = eventData.object.id;
        const chatId = eventData.object.metadata.chat_id;
        const orderId = eventData.object.metadata.order_id;
        console.log('orderId', orderId);

        updatePayment(orderId, 'paymentSucceeded');

        // Send a message to your Telegram bot
        await bot.telegram.sendMessage(chatId, mockText.final);
        // Платеж ${paymentId} на сумму ${amount} ${currency} успешно обработан.
    }

    res.sendStatus(200); // Respond with 200 OK
});

function updatePayment(orderId, status) {
    userController.updatePayment({
        order_id: orderId,
        status: status,
        // full_name: data.form?.fullName,
        // telegram_nick: data.telegramNick,
        // amount: data.price,
        // currency: 'RUB',
        // order_id: data.orderId,
        // comment: data.form?.comment,
        // address: data.form?.address,
        // payment_method: data.form?.paymentMethod,
        // chat_id: data.chatId,
    });
}

function savePayment(data, status) {
    userController.savePayment({
        status: status,
        full_name: data.form?.fullName,
        telegram_nick: data.telegramNick,
        products: data.products,
        amount: data.price,
        currency: 'RUB',
        order_id: data.orderId,
        comment: data.form?.comment,
        address: data.form?.address,
        payment_method: data.form?.paymentMethod,
        chat_id: data.chatId,
    });
}

// Enable graceful stop
process.once('SIGINT', () => bot.stop('SIGINT'))
process.once('SIGTERM', () => bot.stop('SIGTERM'))

// const server = http.createServer((req, res) => {
//     res.writeHead(200, {"Content-Type": "text/plain"});
//     res.end("huinaaaa!!!!!!")
// })

// app.get('/', (req, res) => {
//     res.send('Hello World!');
// });

// Замените пути к вашим SSL сертификатам
const options = {
    key: fs.readFileSync('/etc/letsencrypt/live/tgmini.ru/privkey.pem'),
    cert: fs.readFileSync('/etc/letsencrypt/live/tgmini.ru/fullchain.pem')
};

app.get('/', (req, res) => {
    res.send('Hello, HTTPS!');
});

app.use('/api', router);

https.createServer(options, app).listen(PORT, () => {
    console.log(`HTTPS Server running on ports http://localhost:${PORT}`);
});

// app.listen(PORT, () => {
//     console.log(`HTTPS Server running on port http://localhost:${PORT}`);
// });

bot.launch();