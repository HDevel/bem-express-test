var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    url = 'mongodb://0.0.0.0:27017/dns-shop';

module.exports = function(req, callback) {
    var text = (req.query.text || '').toString().trim(),
        diff = parseFloat(req.query.diff) || (text ? 0 : -40);

    diff = diff / 100;

    MongoClient.connect(url, function(err, db) {
        var search = combination(text),
            find = {};

        if (text.match(/^".+"$/)) {
            search = text.slice(1, -1);
        }

        find.query = new RegExp(search);

        if (diff !== 0) {
            find['price.diff'] = diff < 0 ? { $lte: diff } : { $gte: diff };
        }

        db.collection('items')
            .find(find)
            .limit(100)
            .toArray(function(err, docs) {
                db.close();
                callback(docs
                    .sort(function(a, b) {
                        return b.prices[0].price - a.prices[0].price
                    })
                    .map(function(item) {
                        return {
                            block: 'item',
                            item: item
                        };
                    }));
            });
    });
};
