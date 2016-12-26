var request = require('request'),
    donePatch = [],
    retries = 2,
    pageRetries = 2,
    exitTimeout,
    headers = {
        'X-Requested-With': 'XMLHttpRequest',
        cookie: 'city_path=simferopol;'
    };

function getCatalogs(callback) {
    request({
        url: 'http://www.dns-shop.ru/',
        encoding: 'utf8',
        jar: true,
        followAllRedirects: true,
        maxRedirects: 2,
        headers: headers
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {
            if (body === 'TemporaryRedirect' || body.indexOf('<title>302 Found</title>') > -1) {
                console.log(body);
                if (retries > 0) {
                    retries--;

                    getCatalogs(callback);
                }
                return
            }

            var obj = {},
                rtn = body.match(/\/catalog\/[a-z0-9/-]+/g);

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
                console.log(body);

                rtn = [];
            }

            callback(rtn);
        } else {
            console.log(error);

            setTimeout(function() {
                getCatalogs(callback);
            }, 5000);
        }
    });
}

function getPrices(path, callback, page, items) {
    var page = page || 0,
        offset = 50 * page,
        sec = 1000,
        min = 60 * sec;

    if (donePatch[path] >= pageRetries) {
        return;
    }

    exit(min);

    items = items || [];

    request({
        url: 'http://www.dns-shop.ru' + path + '?p=' + page + '&offset=' + offset,
        encoding: 'utf8',
        jar: true,
        followAllRedirects: true,
        maxRedirects: 2,
        headers: headers
    }, function(error, response, body) {
        if (!error && response.statusCode == 200) {

            clearTimeout(exitTimeout);

            console.log(path + ' - ' + page + ' - try');
            try {
                body = JSON.parse(body);
            } catch (e) {
            }

            if (typeof body === 'string') {
                console.log(path + ' - ' + page + ' - string');
                var title = body.match(/<title>.+<\/title>/g);

                console.log('JSON parse error at - ' + new Date());
                console.log(path + ' - ' + page + ' - data');

                if (title) {
                    console.log(title[0]);
                }

                console.log(body.replace(/[ 	\n]+/gm, ' ').slice(0, 2000));

                callback(items);
                return
            }

            var rawData = body.content.split('<div class="product" data-id="product"');

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

            if (!body.isEnd) {
                console.log(path + ' - ' + page + ' - parsed');

                exit();
            } else {
                console.log(path + ' - done');
                callback(items);
            }

        } else {
            console.log(path + ' (page: ' + page + ') - error');

            donePatch[path] = donePatch[path] || 0;
            donePatch[path]++;

            if (donePatch[path] < pageRetries) {
                page--;

                exit();
            } else {
                callback(items, 'error');
            }
        }
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
