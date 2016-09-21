modules.define('search', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl(this.name, {
        _onChange: function(e) {
            var val = e.target.getVal().split('%'),
                search = val[0].toLowerCase().trim(),
                diff = val[1];

            while (search.indexOf('  ') >= 0) {
                search = search.replace(/  /g, ' ');
            }

            if (this._onChangeDebounce) {
                clearTimeout(this._onChangeDebounce);
            }

            this._onChangeDebounce = setTimeout(function() {
                history.pushState({}, '', '?text=' + search + (diff ? '&diff=' + diff : ''));

                $.ajax({
                    url: '/search',
                    data: {
                        text: search,
                        diff: diff
                    },
                    success: function(data) {
                        this.emit('search', data);
                    }.bind(this)
                });
            }.bind(this), 500);
        }
    }, {
        live: function() {
            this.liveInitOnBlockInsideEvent('change', 'input', function(e) {
                this._onChange(e);
            });

            return true;
        }
    }));

});
