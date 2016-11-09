var fs = require('fs'),
    MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    mongoProps = require('./../mongo-path'),
    botBlackList = [
        'Scanbot',
        'Mozilla/5.0 (compatible; Googlebot/2.1; +http://www.google.com/bot.html)',
        'Mozilla/5.0 (compatible; bingbot/2.0; +http://www.bing.com/bingbot.htm)'
    ];

module.exports = function(req, callback) {
    var date = new Date(),
        month = String(date.getMonth() + 1),
        day = String(date.getDate()),
        fileName,
        log = {
            UA: req.get('User-Agent'),
            address: req.connection.remoteAddress,
            query: JSON.stringify(req.query),
            date: date
        };

    month = month.length === 1 ? '0' + month : month;
    day = day.length === 1 ? '0' + day : day;

    fileName = 'req-log_' + date.getFullYear() + '-' + month + '-' + day;

    if (botBlackList.indexOf(log.UA) === -1) {
        fs.appendFile('./logs/' + fileName, JSON.stringify(log) + '\n');
    }

    var text = (req.query.text || '').toString().trim(),
        diff = parseFloat(req.query.diff || 0),
        sale = parseInt(req.query.sale || -1000),
        sec = 1000,
        min = sec * 60,
        hour = min * 60,
        day = hour * 24;

    diff = diff / 100;

    MongoClient.connect(mongoProps.path, function(err, db) {
        db.authenticate(mongoProps.user, mongoProps.password, function(err, res) {
            var search = combination(text),
                find = {},
                sort = { "sort": [['price.price', -1]] },
                date = new Date().getTime();

            if (text.match(/^".+"$/)) {
                search = text.slice(1, -1);
            }

            find.query = new RegExp(search);

            if (!text && !diff) {

                find['price.sale.price'] = sale > 0 ? { $gte: sale } : { $lte: sale };
                find['price.firstSeenDate'] = { $gt: (date - day) };
                sort = { "sort": [['price.firstSeenDate', -1]] };
            }

            if (diff !== 0) {
                find['price.sale.percent'] = diff < 0 ? { $lte: diff } : { $gte: diff };
            }

            db.collection('items')
                .find(find, sort)
                .limit(!text && !diff ? 500 : 150)
                .toArray(function(err, docs) {
                    db.close();
                    callback(docs && docs
                        .map(function(item) {
                            return {
                                block: 'item',
                                mods: {
                                    out: date - item.price.lastSeenDate > hour * 4
                                },
                                item: item
                            };
                        }));
                });
        });
    });
};
