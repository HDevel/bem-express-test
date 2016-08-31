modules.define('item-list', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: function() {
                $(window).on('update', function(e, html) {
                    this.domElem.html(html);
                }.bind(this));
            }
        }
    }));

});
