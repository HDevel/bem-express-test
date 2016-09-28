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
            if (data === 'TemporaryRedirect') {
                console.log(data);
                return
            }

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
        setTimeout(function(){
            getCatalogs(callback);
        }, 1000);
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
                        price = Number(priceReg.exec(rawItem)[1]),

                        date = new Date().getTime();

                    items.push({
                        name: name,
                        url: 'http://www.dns-shop.ru' + url,
                        code: code,
                        img: img.indexOf('/') === 0 ? 'http://www.dns-shop.ru' + img : img,
                        price: {
                            lastSeenDate: date,
                            price: price,
                            prevPrice: prevPrice
                        }
                    })
                }
            }

            if (!data.isEnd) {
                console.log(path + ' - ' + page);
                setTimeout(function(){
                    getPrices(path, callback, page + 1, items);
                }, Math.random() * 2500);
            } else {
                console.log(path + ' - done');
                callback(items);
            }

        });
    }).on('error', function(e) {
        setTimeout(function(){
            getPrices(path, callback, page, items);
        }, 1000);
    });
}

module.exports = {
    getCatalogs: getCatalogs,
    getPrices: getPrices
};
