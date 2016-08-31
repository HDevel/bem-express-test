block('item').content()(function() {
    var item = this.ctx.item;

    this.ctx.url = item.url;

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
            content: item.name
        },
        {
            elem: 'prices',
            content: item.prices.map(function(price) {
                return {
                    elem: 'price',
                    content: [
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
