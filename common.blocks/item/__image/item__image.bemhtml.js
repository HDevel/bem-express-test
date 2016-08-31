block('item').elem('image')(
    tag()('img'),
    attrs()(function() {
        return {
            src: this.ctx.url
        }
    })
);
