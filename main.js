import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';
import userController from './controllers/user.controller.js';
import router from './routes/user.routes.js';

var corsOptions = {
    origin: ['htt://localhost:4200', 'https://tgminiapp-ee5d4.web.app/', 'https://api.yookassa.ru/v3/payments'],
    methods: 'GET,POST,PUT,DELETE,PATCH', // разрешенные методы
    credentials: true, // Разрешает использование учетных данных (куки, авторизация и т.д.)
    optionsSuccessStatus: 200
};

import express from 'express';
import cors from 'cors';
import axios from 'axios';
import https from 'https';
import fs from 'fs';

const app = express();
const PORT = process.env.PORT || 8443;
app.use(cors(corsOptions));
app.use(express.json())

const token = '7478645760:AAFZTKbydXzv6eGfFD8J1y-ekpGV8RCXDDw';
const webAppUrl = 'https://tgminiapp-ee5d4.web.app/';

const bot = new Telegraf(token);

bot.command('start', (ctx) => {
    ctx.reply(`
👠 Добро пожаловать в мир танцев с [НАЗВАНИЕ КОМПАНИИ]!

### 📦 Как заказать?
1. Нажмите кнопку [ Каталог ] 
2. Выберите модель обуви и одежду.
3. Оформите заказ и оплатите.
4. Ждите доставку прямо к вашей двери!🎉
        `,
        Markup.keyboard([Markup.button.webApp('👉 Каталог', webAppUrl)])
    )
    // ctx.replyWithPhoto({ source: './product1.jpeg' });
})

bot.on(message('web_app_data'), async (ctx) => {
    const data = ctx.webAppData.data.json();
    const chatId = ctx.message.chat.id;
    const orderId = Math.random().toString(36).substring(7);

    console.log('DATA', data);
    console.log('message', message);
    const products = JSON.stringify(data?.products);

    console.log('products', products);

    const price = data?.price;
    const fullName = data?.form.fullName || 'Уважаемый клиент';
    const telegramNick = '@' + ctx.message.chat.username || 'не указан';
    // const email = data?.form.email || 'не указан';
    // const phone = data?.form.phone || 'не указан';
    // const comment = data?.form.comment || 'Нет комментариев';
    // const address = data?.form.address || 'Не указан';
    // const city = data?.form.city || 'Не указан';
    // const postalCode = data?.form.postalCode || 'Не указан';
    // const paymentMethod = data?.form.paymentMethod || 'Не указан';

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
                sendPayment(paymentData, 'createPayment');
                const confirmationUrl = `${payment.confirmation.confirmation_url}`;

                const keyboard = Markup.inlineKeyboard([
                    [Markup.button.url('Оплатить 🥳', confirmationUrl)]
                ]);

                // ctx.reply(`
                //     Платеж создан, ссылка для оплаты: 
                //     Уважаемый(ая) ${fullName}`, keyboard);

                // console.log('webApp5', ctx.webAppData);
                // ctx.webApp.openLink();

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

                Если у вас есть вопросы, не стесняйтесь обращаться к нам.

                С уважением,
                Ваша команда [НАЗВАНИЕ КОМПАНИИ]🌸`,
                keyboard);
            })
            .catch(err => {
                console.error(err);
                ctx.reply('Произошла ошибка при создании платежа.');
            });
    } else {
        ctx.reply('Не удалось получить цену заказа.');
    }
})

async function createPayment(price, chatId, orderId) {

    console.log(`createPayment`);

    const paymentData = {
        amount: {
            value: price.toString(),
            currency: 'RUB'
        },
        confirmation: {
            type: 'redirect',
            return_url: 'https://t.me/shopifytgmini_bot'
        },
        capture: true,
        description: 'Оплата заказа',
        metadata: {
            order_id: orderId,
            chat_id: chatId
        },
    };

    const headers = {
        'Content-Type': 'application/json',
        'Idempotence-Key': Math.random().toString(36).substring(7),
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        "Access-Control-Allow-Headers": "Origin,X-Requested-With,Content-Type,Accept",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        'Authorization': 'Basic ' + btoa('435225' + ':' + 'test_o7wEW2Yo1o3uTzfjibTwXjqciVdVFGf5iUEfoTtl_7o')
    };

    const options = {
        headers: headers,
        auth: {
            username: '435225',
            password: 'test_o7wEW2Yo1o3uTzfjibTwXjqciVdVFGf5iUEfoTtl_7o'
        }
    };

    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, options);
    return response.data;
}

app.post('/webhook', async (req, res) => {
    const eventData = req.body;
    console.log('eventData', eventData);

    if (eventData?.event === 'payment.succeeded') {
        const paymentId = eventData.object.id;
        const chatId = eventData.object.metadata.chat_id;
        const orderId = eventData.object.metadata.order_id;
        console.log('orderId', orderId);

        updatePayment(orderId, 'paymentSucceeded');

        // Send a message to your Telegram bot
        await bot.telegram.sendMessage(chatId,
            `
Спасибо за вашу покупку! 🎉🎉🎉
ID платежа: ${paymentId}

Мы рады сообщить вам, что ваша заказ был успешно оформлен.
`);
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

function sendPayment(data, status) {
    userController.createPayment({
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