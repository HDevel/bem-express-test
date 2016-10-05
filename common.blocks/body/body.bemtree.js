block('body').content()(function() {
    var items = this.data.items,
        current = this.data.current;

    return [
        {
            block: 'item-list',
            content: [
                'Найдено: ' + items.length + (current ? '; Обновление: ' + current.toFixed(1) + '%' : ''),
                items
            ]
        }
    ];
});
