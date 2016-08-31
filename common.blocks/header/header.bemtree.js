block('header').content()(function() {
    return [
        {
            block: 'search',
            text: this.data.query.text
        },
    ];
});
