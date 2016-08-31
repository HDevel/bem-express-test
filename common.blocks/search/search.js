modules.define('search', ['i-bem__dom', 'jquery'], function(provide, BEMDOM, $) {

    provide(BEMDOM.decl(this.name, {
        onSetMod: {
            js: function() {
                var options = this.options = {};

                location.search.split(/\?|&/).forEach(function(v) {
                    if (v.length) {
                        v = v.split('=');
                        options[v[0]] = decodeURIComponent(v[1]);
                    }
                });

                if (options.text) {
                    this.findBlockOn('input', 'input').setVal(options.text);
                }
            }
        },

        _onChange: function(e) {
            var val = e.target.getVal();

            if (this.options.text === val || val.length < 3) {
                return
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
                        $(window).trigger('update', data);
                    }
                });
            }.bind(this), 500);
        }
    }, {
        live: function() {
            this.liveInitOnBlockInsideEvent('change', 'input', function(e) {
                this._onChange(e);
            });

            return false;
        }
    }));

});
