import { Telegraf, Markup } from 'telegraf';
import { message } from 'telegraf/filters';

var corsOptions = {
    origin: ['htt://localhost:4200','https://tgminiapp-ee5d4.web.app/', 'https://api.yookassa.ru/v3/payments'], 
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
app.use(cors(corsOptions));

// app.use(cors());

const token  = '7208102281:AAFXC9mcTML2YzMu_N43SgUru6y6F7utFlQ';
const webAppUrl = 'https://tgminiapp-ee5d4.web.app/';

const bot = new Telegraf(token);

bot.command('start', (ctx) => {
    ctx.reply(`
👠 Добро пожаловать в мир танцев с ANGELS ONE HEELS!

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
    // const data = ctx.webAppData.data.json();
    // console.log(ctx.webAppData.data.text());
    // ctx.reply(`Вы купили товаров на сумму: ${data?.price} ₽` ?? '')
    const data = ctx.webAppData.data.json();
    const price = data?.price;

    if (price) {
        await createPayment(price)
            .then(payment => {
                ctx.reply(`Вы купили товаров на сумму: ${price} ₽. Платеж создан, ссылка для оплаты: ${payment.confirmation.confirmation_url}`);
            })
            .catch(err => {
                console.error(err);
                ctx.reply('Произошла ошибка при создании платежа.');
            });
    } else {
        ctx.reply('Не удалось получить цену заказа.');
    }

})

async function createPayment(price) {
    console.log(`createPayment`);
    const paymentData = {
        amount: {
            value: price.toString(),
            currency: 'RUB'
        },
        confirmation: {
            type: 'redirect',
            return_url: 'https://tgminiapp-ee5d4.web.app/confirm'
        },
        capture: true,
        description: 'Оплата заказа',
        metadata: {
            order_id:  Math.random().toString(36).substring(7),
        },
    };

    const headers = {
        'Content-Type': 'application/json',
        'Idempotence-Key': Math.random().toString(36).substring(7),
        'Access-Control-Allow-Origin': 'http://localhost:4200',
        "Access-Control-Allow-Headers" : "Origin,X-Requested-With,Content-Type,Accept",
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
    console.log(`webhook`);
    console.log('req', req);

    await bot.telegram.sendMessage('848481266', `Платеж на сумму успешно обработан.`);
    
    // Check if the event is a payment.succeeded
    if (eventData?.event === 'payment.succeeded') {
        const paymentId = eventData.data.id;
        const amount = eventData.data.amount.value;
        const currency = eventData.data.amount.currency;

        // Send a message to your Telegram bot
        await bot.telegram.sendMessage('848481266', `Платеж ${paymentId} на сумму ${amount} ${currency} успешно обработан.`);
    }

    res.sendStatus(200); // Respond with 200 OK
});

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

https.createServer(options, app).listen(8443, () => {
    console.log('HTTPS Server running on port 8443');
});

bot.launch();