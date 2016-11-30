var botUsersWish = {
    'jbl xtreme': ['321196613'],
    'iphone se': ['321196613'],
    'iphone 7': ['321196613'],
    ps4: ['321196613'],
    'про': ['321196613'],
    playstation: ['321196613']
};

item = {
    name: 'iphone se',
    sale: -100,
    current: 100,
    last: 231,
    url: 'adasd'
};

var bot = {
    sendMessage: function() {
        console.log(arguments);
    }
};


for (var wish in botUsersWish) {
    if (botUsersWish.hasOwnProperty(wish) && item.name.indexOf(wish) >= 0) {
        botUsersWish[wish].forEach(function(userId) {
            var html = 'Товар подешевел на $sale$₽ \n$current$₽ ($last$₽)\n<a href="$url$">$text$</a>'
                .replace('$sale$', item.sale * -1)
                .replace('$current$', item.current)
                .replace('$last$', item.last)
                .replace('$url$', item.url)
                .replace('$text$', item.name);

            bot.sendMessage(userId, html, {
                parse_mode: 'HTML'
            });
        });
    }
}


