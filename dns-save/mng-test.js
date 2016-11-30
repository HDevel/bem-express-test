var MongoClient = require('mongodb').MongoClient;

// Connection URL
var mongoProps = require('./../mongo-path');

MongoClient.connect(mongoProps.path, function(err, db) {
    db.authenticate(mongoProps.user, mongoProps.password, function(err, res) {
        var collection = db.collection('items');

        perf(10);

        function perf(count) {
            var profile = new Date();

            collection.find({ code: 1039653 }).toArray(function(err, docs) {
                // console.log(docs && docs[0]);
                console.log(profile - new Date());

                if (count > 0) {
                    perf(--count);
                } else {
                    db.close();
                    process.exit();
                }
            });
        }
    });
});

