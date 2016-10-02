block('item').elem('date')(
    tag()('span'),
    content()(function() {
        var date = new Date(this.ctx.date + 10800000), // хардкод, Москва
            min = date.getMinutes().toString(),
            hour = date.getHours(),
            day = date.getDate(),
            weekDay = date.getDay(),
            month = date.getMonth() + 1,
            year = date.getFullYear(),
            weekDays = ['ВС', 'ПН', 'ВТ', 'СР', 'ЧТ', 'ПТ', 'СБ'];

        if (min.length < 2) {
            min = '0' + min;
        }

        return [
            {
                elem: 'week-day',
                elemMods: {
                    day: weekDay
                },
                content: weekDays[weekDay]
            },
            day + '.' + month + '.' + year + ' ' + hour + ':' + min
        ]
    })
);
