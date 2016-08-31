var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/dns-shop';

function update(colName, query, item, callack) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection(colName);

        collection.createIndex('names', { name: "text" });

        collection.find(query).toArray(function(err, docs) {
            if (!docs.length) {
                collection.insert(item, function() {
                    db.close();
                    callack();
                });
            } else {
                collection.update(query, item, function() {
                    db.close();
                    callack();
                });
            }
        });
    });
}

function get(colName, query, callback) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection(colName);

        collection.find(query).toArray(function(err, docs) {
            db.close();
            callback(docs && docs[0]);
        });
    });
}

module.exports = {
    update: update,
    get: get
};
