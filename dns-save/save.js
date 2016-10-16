var DNS = require('./dns-get');
var fs = require('fs');
var progressFile = './dns-save/.current-progress';
var dbCollection = 'items';
var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://0.0.0.0:27017/dns-shop';

console.log('Process start at - ' + new Date());

DNS.getCatalogs(function(catalogs) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection(dbCollection);

        getCat(catalogs, 0, collection, db);
    });

});

function getCat(catalogs, from, collection, db) {
    fs.writeFileSync(progressFile, from / (catalogs.length - 1));

    // console.log('catalog ' + from + ' of ' + catalogs.length);

    if (catalogs.length <= from) {
        fs.writeFileSync(progressFile, 0);
        console.log('all done');

        setTimeout(function(){
            db.close();
            process.exit();
        }, 60 * 1000);

        return
    }

    /*
    if (catalogs[from].indexOf('17a89c5616404e77/korpusa') === -1) {
        getCat(catalogs, ++from, collection, db);

        return
    }
    */

    DNS.getPrices(catalogs[from], function(items) {
        items && items.forEach(function(item) {
            item.price.sale = {
                percent: 0,
                date: 0,
                price: 0
            };

            collection.find({ code: item.code }).toArray(function(err, docs) {
                if (!docs.length) {
                    item.price.firstSeenDate = item.price.lastSeenDate;
                    item.prices = [item.price];
                    item.query = item.name.toLowerCase();

                    collection.insert(item);
                } else {
                    var doc = docs[0];

                    item.prices = doc.prices || [item.price];

                    var lastID = item.prices.length - 1,
                        last = item.prices[lastID],
                        current = item.price;

                    if (last.price != current.price || last.prevPrice != current.prevPrice) {
                        current.sale = {
                            percent: (current.price / last.price) - 1,
                            price: current.price - last.price
                        };

                        current.firstSeenDate = current.lastSeenDate;

                        item.prices.push(current);
                    } else {
                        current.sale = last.sale;
                        current.firstSeenDate = last.firstSeenDate || current.lastSeenDate;

                        item.prices[lastID] = current;
                    }

                    if (item.name.indexOf('�') !== -1 && doc.name.indexOf('�') === -1) {
                        item.name = doc.name;
                    }

                    item.query = item.name.toLowerCase();

                    collection.update({ code: item.code }, item);
                }
            });
        });

        setTimeout(function() {
            getCat(catalogs, ++from, collection, db);
        }, Math.random() * 2500);
    });
}
