block('item').elem('current-price')(
    tag()('span'),
    content()(function() {
        return this.ctx.content.replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
    })
);
