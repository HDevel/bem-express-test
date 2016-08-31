var http = require('http');

function getCatalogs(callback) {
    var options = {
            host: 'www.dns-shop.ru',
            port: 80,
            path: ''
        },
        data = '';

    http.get(options, function(res) {
        res.on("data", function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            var obj = {};
            data = data
                .match(/\/catalog\/[a-z0-9/-]+/g)
                .filter(function(v) {
                    if (obj[v]) {
                        return false;
                    }
                    obj[v] = true;

                    return true;
                });

            callback(data);
        });
    }).on('error', function(e) {
        console.log('getCatalogs error');
    });
}

function getPrices(path, callback, page, items) {
    var page = page || 0;
    var offset = 50 * page;
    var options = {
        host: 'www.dns-shop.ru',
        port: 80,
        path: path + '?p=' + page + '&offset=' + offset,
        headers: {
            'X-Requested-With': 'XMLHttpRequest',
            cookie: 'city_path=simferopol'
        }
    };
    var data = '';

    http.get(options, function(res) {
        res.on("data", function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            if (data.indexOf('<') <= 5) {
                callback();
                return
            }

            data = JSON.parse(data);

            var rawData = data.content.split('<div class="product" data-id="product"');
            items = items || [];

            for (var i = 1; i < rawData.length; i++) {
                var rawItem = rawData[i],

                    codeReg = /data-code="([0-9]+)"/,
                    code = codeReg.exec(rawItem);

                if (code) {
                    code = Number(code[1]);


                    var nameReg = /class="ec-price-item-link">([^<]+)</,
                        name = nameReg.exec(rawItem)[1]
                            .replace(/&quot;/g, '"'),

                        urlReg = /<a href="([/a-zA-Z0-9-_]+)" class="ec-price-item-link"/,
                        url = urlReg.exec(rawItem)[1],

                        imgReg = /data-image-tablet="([^"]+)"/,
                        img = imgReg.exec(rawItem)[1],

                        prevPriceReg = /<s class="prev-price-total">([0-9 ]+)/,
                        prevPrice = prevPriceReg.exec(rawItem),
                        prevPrice = Number(prevPrice && prevPrice[1].replace(/ /g, '') || 0),

                        priceReg = /data-product-param="price" data-value="([0-9]+)"/,
                        price = Number(priceReg.exec(rawItem)[1]);

                    items.push({
                        name: name,
                        query: name.toLowerCase(),
                        url: 'http://www.dns-shop.ru' + url,
                        code: code,
                        img: img.indexOf('/') === 0 ? 'http://www.dns-shop.ru' + img : img,
                        price: {
                            date: new Date().getTime(),
                            price: price,
                            prevPrice: prevPrice
                        }
                    })
                }
            }

            if (!data.isEnd) {
                console.log(path + ' - ' + page);

                // setTimeout(function(){
                    getPrices(path, callback, page + 1, items);
                // }, Math.random() * 2000);
            } else {
                console.log(path + ' - done');
                callback(items);
            }

        });
    }).on('error', function(e) {
        console.log('error');
    });
}

module.exports = {
    getCatalogs: getCatalogs,
    getPrices: getPrices
};


// http://c.dns-shop.ru/thumb/st1/fit/320/250/7685cc6aaca052f6108ea508941cc52f/c06c88a687e2c9099d1e68a79db49804f14ce6a9b8d1533d20226af86e54e7cd.jpg


// 123
// 213
// 231

// 312
// 132

// 321