var DNS = require('./dns-get'),
    fs = require('fs'),
    TelegramBot = require('node-telegram-bot-api'),
    bot = new TelegramBot(require('./../bot-token')),
    progressFile = './dns-save/.current-progress',
    blackList = require('./black-list'),
    shuffle = require('./shuffle'),
    dbCollection = 'items',
    MongoClient = require('mongodb').MongoClient,
    botUsersFile = '.bot-users',
    botUsers;

if (!fs.existsSync(botUsersFile)) {
    fs.writeFileSync(botUsersFile, JSON.stringify({}));
}

// Connection URL
var mongoProps = require('./../mongo-path');

console.log('Process start at - ' + new Date());

DNS.getCatalogs(function(catalogs) {
    MongoClient.connect(mongoProps.path, function(err, db) {
        db.authenticate(mongoProps.user, mongoProps.password, function(err, res) {
            var collection = db.collection(dbCollection);

            getCat(shuffle(catalogs), 0, collection, db);
        });
    });

});

function getCat(catalogs, from, collection, db) {
    fs.writeFileSync(progressFile, from / (catalogs.length - 1));

    // console.log('catalog ' + from + ' of ' + catalogs.length);

    if (catalogs.length <= from) {
        fs.writeFileSync(progressFile, 0);
        console.log('all done');

        setTimeout(function(){
            db.close();
            process.exit();
        }, 60 * 1000);

        return
    }

    var path = catalogs[from];

    if (blackList.indexOf(path) > -1) {
        console.log(path + ' - skip');
        getCat(catalogs, ++from, collection, db);

        return
    }

    /*
    if (path.indexOf('17a89c5616404e77/korpusa') === -1) {
        getCat(catalogs, ++from, collection, db);

        return
    }
    */

    DNS.getPrices(path, function(items) {
        botUsers = JSON.parse(fs.readFileSync(botUsersFile));

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

                    collection.insert(item);
                } else {
                    var doc = docs[0];

                    item.prices = doc.prices || [item.price];

                    var lastID = item.prices.length - 1,
                        last = item.prices[lastID],
                        current = item.price;

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

                    if (item.name.indexOf('�') !== -1 && doc.name.indexOf('�') === -1) {
                        item.name = doc.name;
                    }

                    item.query = item.name.toLowerCase();

                    collection.update({ code: item.code }, item);
                }
            });
        });

        setTimeout(function() {
            getCat(catalogs, ++from, collection, db);
        }, Math.random() * 1500 + 1000);
    });
}

function sendSale(item) {
    for (var user in botUsers) {
        if (botUsers.hasOwnProperty(user)) {
            var botItems = botUsers[user].items;

            for (var botItem in botItems) {
                if (
                    botItems.hasOwnProperty(botItem) &&
                    item.name.toLowerCase().match(botItem)
                ) {
                    var html = 'Товар подешевел на $sale$₽ \n$current$₽ ($last$₽)\n<a href="$url$">$text$</a>'
                        .replace('$sale$', item.sale * -1)
                        .replace('$current$', item.current)
                        .replace('$last$', item.last)
                        .replace('$url$', item.url)
                        .replace('$text$', item.name);

                    bot.sendMessage(user, html, {
                        parse_mode: 'HTML'
                    });
                }
            }
        }
    }
}
