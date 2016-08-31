block('body').content()(function() {
    return [
        {
            block: 'item-list',
            content: this.data.items
        }
    ];
});
