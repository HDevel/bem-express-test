var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    url = 'mongodb://0.0.0.0:27017/dns-shop';

module.exports = function(req, callback) {
    var text = (req.query.text || '').toString().trim(),
        diff = parseFloat(req.query.diff || 0);

    diff = diff / 100;

    MongoClient.connect(url, function(err, db) {
        var search = combination(text),
            find = {},
            sort = { "sort": [['price.price', -1]] };

        if (text.match(/^".+"$/)) {
            search = text.slice(1, -1);
        }

        find.query = new RegExp(search);

        if (!text && !diff) {
            var sec = 1000,
                min = sec * 60,
                hour = min * 60,
                day = hour * 24;

            diff = 0.001;
            find['price.diffDate'] = { $gt: (new Date().getTime() - day) };
            sort = { "sort": [['price.date', -1]] };
        }

        if (diff !== 0) {
            find['price.diff'] = diff < 0 ? { $lte: diff } : { $gte: diff };
        }

        db.collection('items')
            .find(find, sort)
            .limit(100)
            .toArray(function(err, docs) {
                db.close();
                callback(docs
                    .map(function(item) {
                        return {
                            block: 'item',
                            item: item
                        };
                    }));
            });
    });
};
