var MongoClient = require('mongodb').MongoClient,
    combination = require('./combinations'),
    url = 'mongodb://localhost:27017/dns-shop';

module.exports = function(req, callback) {
    if (req.query.text === undefined) {
        callback([]);

        return;
    }

    MongoClient.connect(url, function(err, db) {
        var query = req.query.text,
            search = combination(query);

        if (query.match(/^".+"$/)) {
            search = query.slice(1,-1);
        }

        db.collection('items')
            .find({ query: new RegExp(search) })
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
