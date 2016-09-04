block('item').elem('date')(
    tag()('span'),
    content()(function() {
        var date = new Date(this.ctx.date),
            min = date.getMinutes().toString(),
            hour = date.getHours(),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        if (min.length < 2) {
            min = '0' + min;
        }

        return day + '.' + month + '.' + year + ' ' + hour + ':' + min;
    })
);
