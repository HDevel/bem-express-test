var DNS = require('./dns-get');
var fs = require('fs');
var idFile = './dns-save/.current-id';
var dbCollection = 'items';
var MongoClient = require('mongodb').MongoClient;

// Connection URL
var url = 'mongodb://0.0.0.0:27017/dns-shop';

DNS.getCatalogs(function(catalogs) {
    MongoClient.connect(url, function(err, db) {
        var collection = db.collection(dbCollection),
            id = 0;

        if (fs.existsSync(idFile)) {
            id = Number(fs.readFileSync(idFile));
        }

        getCat(catalogs, id, collection, db);
    });

});

function getCat(catalogs, from, collection, db) {
    fs.writeFileSync(idFile, from);

    console.log('catalog ' + from + ' of ' + catalogs.length);

    if (catalogs.length <= from) {
        db.close();
        fs.writeFileSync(idFile, 0);
        console.log('all done');
        setTimeout(process.exit, 60 * 1000);

        return
    }

    // if(catalogs[from].indexOf('17a89c5616404e77/korpusa') === -1){
    //     getCat(catalogs, ++from, collection, db);
    //
    //     return
    // }

    DNS.getPrices(catalogs[from], function(items) {
        items && items.forEach(function(item) {
            item.price.sale = {
                percent: 0,
                date: 0,
                price: 0
            };

            collection.find({ code: item.code }).toArray(function(err, docs) {
                if (!docs.length) {
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
                            date: new Date().getTime(),
                            price: current.price - last.price
                        };

                        item.prices.push(current);
                    } else {
                        current.sale = last.sale;

                        current.sale = {
                            percent: (current.price / item.prices[lastID - 1].price) - 1,
                            date: (last.sale && last.sale.date) || last.diffDate || 0,
                            price: current.price - item.prices[lastID - 1].price
                        };

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

        setTimeout(function(){
            getCat(catalogs, ++from, collection, db);
        }, Math.random() * 500);
    });
}
