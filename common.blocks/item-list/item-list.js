modules.define('item-list', ['i-bem__dom', 'search'], function(provide, BEMDOM, Search) {

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: function() {
                Search.on('search', function(e, html) {
                    this.domElem.html(html);
                }.bind(this));
            }
        }
    }));

});
