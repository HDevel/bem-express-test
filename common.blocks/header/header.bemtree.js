block('header').content()(function() {
    var query = this.data.query,
        text = '',
        sale = Number(query.sale);

    text += sale ? sale + 'руб' : '';
    text += query.text || '';
    text += query.diff ? ' %' + query.diff : '';

    return [
        {
            block: 'search',
            text: text
        }
    ];
});
