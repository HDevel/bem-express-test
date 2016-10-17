modules.define('search', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: {
                inited: function() {
                    this._input = this.findBlockOn('input', 'input');
                    history.replaceState({ text: this._input.getVal() }, '');

                    this._bindEvents();
                }
            }
        },

        _bindEvents: function() {
            this._input.on('change', this._onChange, this);

            window.addEventListener('popstate', function(e) {
                this._input.setVal(e.state.text);
            }.bind(this), false);
        },

        _onChange: function(e) {
            var val = e.target.getVal(),
                clearVal = val.replace(/[*\[\](+)]/g, ''),
                valData = val.split('%'),
                search = valData[0].toLowerCase().trim(),
                diff = valData[1],
                sale = '';

            if (val !== clearVal) {
                e.target.setVal(clearVal);
                return
            }

            search = search.replace(/ +/g, ' ');

            if (search.match(/^-?[0-9]+руб$/)) {
                sale = parseInt(search);
                search = '';
            }

            clearTimeout(this._onChangeDebounce);


            this._onChangeDebounce = setTimeout(function() {
                if (history.state && history.state.text !== val) {
                    history.pushState({ text: val }, '', '?' +
                        'text=' + search +
                        (sale != '' ? '&sale=' + sale : '') +
                        (diff ? '&diff=' + diff : '')
                    );
                }

                if (this._ajax) {
                    this._ajax.abort();
                }

                this._ajax = $.ajax({
                    url: '/search',
                    data: {
                        text: search,
                        diff: diff,
                        sale: sale
                    },
                    success: function(data) {
                        this.emit('search', data);
                    }.bind(this)
                });
            }.bind(this), 500);
        }
    }));

});
