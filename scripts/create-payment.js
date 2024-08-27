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

export default createPayment;