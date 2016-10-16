block('header').content()(function() {
    var query = this.data.query,
        text = '';

    text += query.sale != undefined ? query.sale + 'руб' : '';
    text += query.text || '';
    text += query.diff ? ' %' + query.diff : '';

    return [
        {
            block: 'search',
            text: text
        }
    ];
});
