block('item').content()(function() {
    var item = this.ctx.item;

    return [
        {
            elem: 'preview',
            content: {
                block: 'image',
                mix: {
                    block: this.block,
                    elem: 'image'
                },
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
            content: item.prices.reverse().map(function(price) {
                var round = [price.price, price.prevPrice].map(function(v) {
                    var lastTwo = v.toString().slice(-2);

                    if (lastTwo === '99') {
                        return v + 1;
                    } else if (lastTwo === '90') {
                        return v + 10;
                    }

                    return v;
                });


                return {
                    elem: 'price',
                    content: [
                        {
                            elem: 'date',
                            date: price.firstSeenDate
                        },
                        {
                            elem: 'current-price',
                            content: round[0]
                        }, price.prevPrice ? {
                            elem: 'previous-price',
                            content: round[1]
                        } : ''
                    ]
                }
            })
        }
    ];
});
