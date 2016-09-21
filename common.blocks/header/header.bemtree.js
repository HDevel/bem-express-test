block('header').content()(function() {
    var query = this.data.query;

    return [
        {
            block: 'search',
            text: query.text + (query.diff ? ' %' + query.diff : '')
        }
    ];
});
