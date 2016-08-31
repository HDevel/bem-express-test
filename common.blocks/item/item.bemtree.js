block('item').content()(function() {
    var item = this.ctx.item;

    return [
        {
            elem: 'preview',
            content: {
                elem: 'image',
                url: item.img
            }
        },
        {
            elem: 'name',
            url: item.url,
            content: item.name
        },
        {
            elem: 'prices',
            content: item.prices.map(function(price) {
                return {
                    elem: 'price',
                    content: [
                        {
                            elem: 'date',
                            date: price.date
                        },
                        {
                            elem: 'current-price',
                            content: price.price
                        }, price.prevPrice ? {
                            elem: 'previous-price',
                            content: price.prevPrice
                        } : ''
                    ]
                }
            })
        }
    ];
});