modules.define('search', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl(this.name, {
        _onChange: function(e) {
            var val = $.trim(e.target.getVal().toLowerCase());

            while (val.indexOf('  ') >= 0) {
                val = val.replace(/  /g, ' ');
            }

            if (this._onChangeDebounce) {
                clearTimeout(this._onChangeDebounce);
            }

            this._onChangeDebounce = setTimeout(function() {
                history.pushState({}, '', '?text=' + val);

                $.ajax({
                    url: 'http://localhost:3000/search',
                    data: {
                        text: val
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
