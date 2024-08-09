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

const app = express();
app.use(cors(corsOptions));

// app.use(cors());

const token  = '7208102281:AAFXC9mcTML2YzMu_N43SgUru6y6F7utFlQ';
const webAppUrl = 'https://tgminiapp-ee5d4.web.app/';

const bot = new Telegraf(token);

bot.command('start', (ctx) => {
    ctx.reply(
        'Заходи в наш интернет магазин по кнопке ниже',
        Markup.keyboard([Markup.button.webApp('Сделать заказ', webAppUrl)])
    )
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
                ctx.reply(`Вы купили товаров на сумму: ${price} ₽. 
                    Платеж создан, ссылка для оплаты: ${payment.confirmation.confirmation_url}`);
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
        // //   "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,HEAD,PUT,PATCH,POST,DELETE",
        'Authorization': 'Basic ' + btoa('435225' + ':' + 'test_kKVmfRlLjKWvfXqriLSvam67FigmMu7emcFoE8xa47s')
    };

    const options = {
        headers: headers,
        auth: {
            username: '435225',
            password: 'test_kKVmfRlLjKWvfXqriLSvam67FigmMu7emcFoE8xa47s'
        }
    };

    const response = await axios.post('https://api.yookassa.ru/v3/payments', paymentData, options);

    return response.data;
}

app.post('/webhook', express.json(), (req, res) => {
    const event = req.body;

    // Проверяем, что это событие о успешной оплате
    if (event.event === 'payment.succeeded') {
        const paymentId = event.data.id; // ID платежа
        const amount = event.data.amount.value; // Сумма платежа

        // Отправляем сообщение пользователю бота (если у вас есть ID пользователя)
        const userId = 'USER_ID'; // Замените на реальный ID пользователя
        bot.telegram.sendMessage(userId, `Ваш платеж на сумму ${amount} ₽ был успешно обработан. ID платежа: ${paymentId}`);
    }

    // Возвращаем статус 200 OK
    res.sendStatus(200);
});

bot.launch();