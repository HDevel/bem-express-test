var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/dns-shop';

MongoClient.connect(url, function(err, db) {
    var collection = db.collection('items');

    collection.find({ name: /Ноутбук HP Notebook/ }).toArray(function(err, docs) {
        console.log(docs);
    });

    // collection.createIndex('names', { name: 'text' });
    // collection.find({ name: /Ноутбук HP Notebook 15-ac104ur/ }).toArray(function(err, docs) {
    // db.close();
    //
    // collection.runCommand( "text" , { search: "Ноутбук" } ,function() {
    //     console.log(arguments)
    // });
    // console.log('===================')
    // console.log(collection.find({$text:{$search:"Apple"}}));
});
