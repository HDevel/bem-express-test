var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    url = 'mongodb://localhost:27017/dns-shop';

module.exports = function(req, callback) {
    if (req.query.text === undefined) {
        callback([]);

        return;
    }

    MongoClient.connect(url, function(err, db) {
        db.collection('items')
            .find({ query: new RegExp(combination(req.query.text)) })
            .limit(100)
            .toArray(function(err, docs) {
                db.close();
                callback(docs.map(function(item) {
                    return {
                        block: 'item',
                        item: item
                    };
                }));
            });
    });
};
