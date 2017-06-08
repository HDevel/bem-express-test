var fs = require('fs'),
    request = require('request'),
    TelegramBot = require('node-telegram-bot-api'),
    bot = new TelegramBot(require('./../bot-token')),
    shuffle = require('./shuffle'),
    dbCollection = 'items',
    MongoClient = require('mongodb').MongoClient,
    botUsersFile = '.bot-users',
    botUsers,
    botUsersWish = {},
    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        cookie: 'current_path=480004732598f438d49efa0d6cbb17127f45f6d2297067ca36485dae93458e4ea%3A2%3A%7Bi%3A0%3Bs%3A12%3A%22current_path%22%3Bi%3A1%3Bs%3A36%3A%223fa69029-f683-11e3-aea1-00155d031202%22%3B%7D;',
        'User-Agent': 'Mozilla/5.0 (compatible; MSIE 9.0; Windows NT 6.1; Trident/5.0; BOIE9;ENUSMSNIP)'
    },
    exitTimeout,
    sec = 1000,
    min = 60 * sec;

timeToExit();

if (!fs.existsSync(botUsersFile)) {
    fs.writeFileSync(botUsersFile, '{}');
}

// Connection URL
var mongoProps = require('./../mongo-path');

console.log('Process start at - ' + new Date());

updateWishs();

MongoClient.connect(mongoProps.path, function(err, db) {
    db.authenticate(mongoProps.user, mongoProps.password, function(err, res) {
        var collection = db.collection(dbCollection);

        getUsersSearch().forEach(function(query) {
            var q = query;
            setTimeout(function() {
                getPrices(q, function(items){
                    savePrices(items, collection)
                });
            }, Math.random() * 20 * min);
        });
    });
});

function savePrices(items, collection) {
    timeToExit();
    items && items.forEach(function(item) {
        item.price.sale = {
            percent: 0,
            date: 0,
            price: 0
        };

        collection.find({ code: item.code }).toArray(function(err, docs) {
            if (!docs.length) {
                item.price.firstSeenDate = item.price.lastSeenDate;
                item.prices = [item.price];
                item.query = item.name.toLowerCase();

                sendSale({
                    current: item.price.price,
                    sale: 0,
                    url: item.url,
                    name: item.name
                });

                collection.insert(item);
            } else {
                var doc = docs[0];

                item.prices = doc.prices || [item.price];

                var lastID = item.prices.length - 1,
                    last = item.prices[lastID],
                    current = item.price;

                if (item.name.indexOf('�') !== -1 && doc.name.indexOf('�') === -1) {
                    item.name = doc.name;
                }

                item.query = item.name.toLowerCase();

                if (last.price != current.price || last.prevPrice != current.prevPrice) {
                    current.sale = {
                        percent: (current.price / last.price) - 1,
                        price: current.price - last.price
                    };

                    current.firstSeenDate = current.lastSeenDate;

                    if (current.sale.price < 0) {
                        sendSale({
                            current: current.price,
                            last: last.price,
                            sale: current.sale.price,
                            url: item.url,
                            name: item.name
                        });
                    }

                    item.prices.push(current);
                } else {
                    current.sale = last.sale;
                    current.firstSeenDate = last.firstSeenDate || current.lastSeenDate;

                    item.prices[lastID] = current;
                }

                collection.update({ code: item.code }, item);
            }
        });
    });
}

function getUsersSearch() {
    var users = JSON.parse(fs.readFileSync('./.bot-users', "utf8")),
        search = {};

    Object.keys(users).forEach(function(user) {
        Object.keys(users[user].items).forEach(function(item) {
            search[item] = true;
        });
    });

    return Object.keys(search);
}

function getPrices(search, callback) {
    var sec = 1000,
        min = 60 * sec,
        items = [];

    exit(min);

    request({
        url: 'http://www.dns-shop.ru/search/?q=' + search.replace(/\s+/, '+'),
        encoding: 'utf8',
        jar: true,
        followAllRedirects: true,
        maxRedirects: 2,
        headers: headers
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            clearTimeout(exitTimeout);

            console.log(search + ' - try');

            var rawData = body.split('<div class="product" data-id="product"');

            for (var i = 1; i < rawData.length; i++) {
                var rawItem = rawData[i],

                    codeReg = /data-code="([0-9]+)"/,
                    code = codeReg.exec(rawItem);

                if (code) {
                    code = Number(code[1]);


                    var nameReg = /class="ec-price-item-link" href="[^"]+">([^<]+)</,
                        name = nameReg.exec(rawItem)[1]
                            .replace(/&quot;/g, '"'),

                        urlReg = /<a class="ec-price-item-link" href="([/a-zA-Z0-9-_]+)"/,
                        url = urlReg.exec(rawItem)[1],

                        imgReg = /data-image-tablet="([^"]+)"/,
                        img = imgReg.exec(rawItem)[1],

                        prevPriceReg = /<s class="prev-price-total">([0-9 ]+)/,
                        prevPrice = prevPriceReg.exec(rawItem),
                        prevPrice = Number(prevPrice && prevPrice[1].replace(/ /g, '') || 0),

                        priceReg = /data-product-param="price" data-value="[0-9.]+">([0-9 ]+)</,
                        price = Number(priceReg.exec(rawItem)[1].replace(/ /g, '')),

                        date = new Date().getTime();

                    items.push({
                        name: name,
                        url: 'http://www.dns-shop.ru' + url,
                        code: code,
                        img: img.indexOf('/') === 0 ? 'http://www.dns-shop.ru' + img : img,
                        price: {
                            lastSeenDate: date,
                            price: price,
                            prevPrice: prevPrice
                        }
                    })
                }
            }

            console.log(search + ' - done');
            callback(items);
        }
    });

    function exit(time) {
        clearTimeout(exitTimeout);

        exitTimeout = setTimeout(function() {
            time && console.log(search + ' - terminate');
        }, time || (Math.random() * 1500 + 1000));
    }
}


return; // =====================================================================================================================================================================

function sendSale(item) {
    console.log('tele sale');
    for (var wish in botUsersWish) {
        if (botUsersWish.hasOwnProperty(wish) && item.name.toLowerCase().indexOf(wish) >= 0) {
            botUsersWish[wish].forEach(function(userId) {
                var html;

                if (item.sale !== 0) {
                    html = 'Товар подешевел на $sale$₽ \n$current$₽ ($last$₽)\n<a href="$url$">$text$</a>'
                        .replace('$sale$', priceRound(item.sale * -1))
                        .replace('$current$', priceRound(item.current))
                        .replace('$last$', priceRound(item.last))
                        .replace('$url$', item.url)
                        .replace('$text$', item.name);
                } else {
                    html = 'Товар появился в продаже, по цене $current$₽\n<a href="$url$">$text$</a>'
                        .replace('$current$', priceRound(item.current))
                        .replace('$url$', item.url)
                        .replace('$text$', item.name);
                }

                console.log('bot send message');
                bot.sendMessage(userId, html, {
                    parse_mode: 'HTML'
                });
            });
        }
    }
}

function updateWishs() {
    botUsers = JSON.parse(fs.readFileSync(botUsersFile));
    botUsersWish = {};

    for (var user in botUsers) {
        if (botUsers.hasOwnProperty(user)) {
            var botItems = botUsers[user].items;

            for (var botItem in botItems) {
                if (
                    botItems.hasOwnProperty(botItem)
                ) {
                    if (!botUsersWish[botItem]) {
                        botUsersWish[botItem] = [];
                    }
                    botUsersWish[botItem].push(user);
                }
            }
        }
    }
}

function exitTO() {
    console.log('exit by timeout');

    process.exit();
}

function timeToExit() {
    clearTimeout(exitTimeout);

    exitTimeout = setTimeout(exitTO, 25 * min);
}

function priceRound(price) {
    var str = price.toString();

    price = parseInt(price);

    if (str.slice(-1) === '9') {
        return price + 1;
    }

    if (str.slice(-2) === '90') {
        return price + 10;
    }

    return price
}
