block('body').content()(function() {
    var items = this.data.items;

    return [
        {
            block: 'item-list',
            content: [
                'Найдено: ' + items.length,
                items
            ]
        }
    ];
});
