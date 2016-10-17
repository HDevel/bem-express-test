var MongoClient = require('mongodb').MongoClient;

// Connection URL
var mongoProps = require('./../mongo-path');

MongoClient.connect(mongoProps.path, function(err, db) {
    var collection = db.collection('items');

    collection.find({ name: /Ноутбук/ }).toArray(function(err, docs) {
        console.log(docs && docs[0]);
        process.exit();
    });
});
