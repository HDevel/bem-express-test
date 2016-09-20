var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    url = 'mongodb://localhost:27017/dns-shop';

module.exports = function(req, callback) {
    req.query.text = req.query.text || '';

    req.query.diff = parseFloat(req.query.diff) || 0;
    req.query.diff = req.query.diff / 100;

    MongoClient.connect(url, function(err, db) {
        var query = req.query.text,
            search = combination(query);

        if (query.match(/^".+"$/)) {
            search = query.slice(1, -1);
        }

        db.collection('items')
            .find({
                query: new RegExp(search),
                'price.diff': { $lte: req.query.diff }
            })
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
