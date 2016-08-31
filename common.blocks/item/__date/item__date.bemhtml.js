block('item').elem('date')(
    tag()('span'),
    content()(function() {
        var date = new Date(this.ctx.date),
            min = date.getMinutes(),
            hour = date.getHours(),
            day = date.getDate(),
            month = date.getMonth() + 1,
            year = date.getFullYear();

        return day + '.' + month + '.' + year + ' ' + hour + ':' + min;
    })
);
