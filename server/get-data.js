var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    mongoProps = require('./../mongo-path');

module.exports = function(req, callback) {
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
                    callback(docs
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
