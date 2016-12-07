var http = require('http'),
    donePatch = [],
    cookie = require('./cookie'),
    city = ' city_path=simferopol;';

function getRandomCookie() {
    return cookie[Math.floor(Math.random() * cookie.length)];
}

function getCatalogs(callback) {
    var cookie = getRandomCookie() + city,
        options = {
            host: 'www.dns-shop.ru',
            port: 80,
            path: '',
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                cookie: cookie
            }
        },
        data = '';

    console.log('getCatalogs cookie - ' + cookie);

    http.get(options, function(res) {
        res.setEncoding('utf8');

        res.on("data", function(chunk) {
            data += chunk;
        });
        res.on("end", function() {
            if (data === 'TemporaryRedirect' || data.indexOf('<title>302 Found</title>') > -1) {
                console.log(data);
                return
            }

            var obj = {},
                rtn = data.match(/\/catalog\/[a-z0-9/-]+/g);

            if (rtn) {
                rtn = rtn.filter(function(v) {
                    if (obj[v]) {
                        return false;
                    }
                    obj[v] = true;

                    return true;
                });
            } else {
                console.log('getCatalogs error:');
                console.log(data);

                rtn = [];
            }

            callback(rtn);
        });
    }).on('error', function(e) {
        setTimeout(function() {
            getCatalogs(callback);
        }, 1000);
    });
}

function getPrices(path, callback, page, items) {
    var page = page || 0,
        offset = 50 * page,
        cookie = getRandomCookie() + city,
        options = {
            host: 'www.dns-shop.ru',
            port: 80,
            path: path + '?p=' + page + '&offset=' + offset,
            headers: {
                'X-Requested-With': 'XMLHttpRequest',
                cookie: cookie
            }
        },
        data = '',
        exitTimeout,
        sec = 1000,
        min = 60 * sec;

    if (donePatch[path + page]) {
        exit();

        return
    }

    donePatch[path + page] = true;

    exit(min * 3);

    items = items || [];

    console.log(path + ' - ' + page + ' - start (' + cookie + ')');

    http.get(options, function(res) {
        res.setEncoding('utf8');

        res.on("data", function(chunk) {
            data += chunk;
        });

        res.on("end", function() {
            clearTimeout(exitTimeout);

            console.log(path + ' - ' + page + ' - try');
            try {
                data = JSON.parse(data);
            } catch (e) {
            }

            if (typeof data === 'string') {
                console.log(path + ' - ' + page + ' - string');
                var title = data.match(/<title>.+<\/title>/g);

                console.log('JSON parse error at - ' + new Date());
                console.log(path + ' - ' + page + ' - data');

                if (title) {
                    console.log(title[0]);
                }

                console.log(data.replace(/[ 	\n]+/gm, ' ').slice(0, 2000));

                callback(items);
                return
            }

            var rawData = data.content.split('<div class="product" data-id="product"');

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

                        priceReg = /data-product-param="price" data-value="[0-9.]+">([0-9 ]+)</,
                        price = Number(priceReg.exec(rawItem)[1].replace(/ /g, '')),

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
                console.log(path + ' - ' + page + ' - parsed');

                exit();
            } else {
                console.log(path + ' - done');
                callback(items);
            }

        });
    }).on('error', function(e) {
        console.log(path + ' - error');

        exit();
    });

    function exit(time) {
        clearTimeout(exitTimeout);

        exitTimeout = setTimeout(function() {
            time && console.log(path + ' - terminate');

            getPrices(path, callback, page + 1, items);
        }, time || (Math.random() * 1500 + 1000));
    }
}

module.exports = {
    getCatalogs: getCatalogs,
    getPrices: getPrices
};
