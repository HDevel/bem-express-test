var DNS = require('./dns-get');
var dbCollection = 'items';
var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://localhost:27017/dns-shop';

DNS.getCatalogs(function(catalogs) {
    // catalogs.forEach(function(v,i) {
    //     if(v.indexOf('besprovodnye-naushniki') >= 0){
    //         console.log(v + ' - ' + i)
    //     }
    // });
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection(dbCollection);

        getCat(catalogs, 0, collection, db);
    });

});

function getCat(catalogs, from, collection, db) {
    console.log('catalog ' + from + ' of ' + catalogs.length);

    if (catalogs.length <= from) {
        db.close();
        process.exit();
    }

    DNS.getPrices(catalogs[from], function(items) {
        items && items.forEach(function(item) {
            collection.find({ code: item.code }).toArray(function(err, docs) {
                if (!docs.length) {
                    item.prices = [item.price];

                    collection.insert(item);
                } else {
                    var doc = docs[0];

                    item.prices = doc.prices || [item.price];

                    var lastID = item.prices.length - 1,
                        last = item.prices[lastID],
                        current = item.price;

                    if (last.price != current.price || last.prevPrice != current.prevPrice) {
                        item.prices.push(current);
                    } else {
                        item.prices[lastID] = current;
                    }

                    collection.update({ code: item.code }, item);
                }
            });
        });

        // setTimeout(function(){
            getCat(catalogs, ++from, collection, db);
        // }, Math.random() * 2000);
    });
}
