var MongoClient = require('mongodb').MongoClient;
var url = 'mongodb://localhost:27017/dns-shop';

module.exports = function(req, callback) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection('items');
        var search = req.query.text.toLowerCase().split(' ');
        collection.find(
            {
                query: new RegExp(search.map(function() {
                    return '(' + search.join('|') + ')'
                }).join('.+'))
            }
        ).toArray(function(err, docs) {
            db.close();
            callback(docs.map(function(item) {
                var right = search.every(function(v) {
                    return item.query.indexOf(v) >= 0;
                });

                return right ? {
                    block: 'item',
                    item: item
                } : '';
            }));
        });
    });
};
