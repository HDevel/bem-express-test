var fs = require('fs'),
    TelegramBot = require('node-telegram-bot-api'),
    bot = new TelegramBot(require('./../bot-token'), {
        polling: true
    }),
    usersFile = '.bot-users',
    users;

if (!fs.existsSync(usersFile)) {
    fs.writeFileSync(usersFile, JSON.stringify({}));
}

users = JSON.parse(fs.readFileSync(usersFile));


// start - Приветствие
bot.onText(/\/start/, function(msg, match) {
    var id = msg.chat.id;

    bot.sendMessage(id, 'Просто напиши мне название товара и я сообщу когда он подешевеет.');
});

bot.onText(/^[^/]/, function(msg) {
    var id = msg.chat.id,
        search = msg.text.toLowerCase(),
        opt = {
            reply_markup: JSON.stringify({
                hide_keyboard: true
            })
        };

    createId(id).items[search] = true;

    saveUsers();

    bot.sendMessage(id, 'Хорошо, я сообщу когда "' + search + '" подешевеет.', opt);
});

// remove - Добавить название товара
bot.onText(/\/remove ?(.+)?/, function(msg, match) {
    var id = msg.chat.id,
        savedItems = createId(id).items,
        items = [];

    if (match[1]) {
        delete savedItems[match[1]];

        bot.sendMessage(id, 'Хорошо, я больше не буду следить за "' + match[1] + '"', {
            reply_markup: {
                hide_keyboard: true
            }
        });
    } else {
        for (var key in savedItems) {
            items.push(['/remove ' + key]);
        }

        bot.sendMessage(id, 'Какой товар удалить?', { reply_markup: { keyboard: items } });
    }

    saveUsers();
});

// list - Вывести список товаров
bot.onText(/\/list/, function(msg) {
    var id = msg.chat.id,
        savedItems = createId(id).items,
        items = [];

    for (var key in savedItems) {
        items.push(key);
    }

    bot.sendMessage(id, 'Вы следите за: \n"' + items.join('"\n"') + '"', { reply_markup: { hide_keyboard: true } });

    saveUsers();
});

function createId(id) {
    if (!users[id]) {
        users[id] = {
            items: {},
            price: 0,
            percent: 0
        }
    }

    return users[id];
}

function saveUsers() {
    fs.writeFileSync(usersFile, JSON.stringify(users));
}
