block('search')(
    js()(true),
    content()(function() {
        return [
            {
                block: 'input',
                mix: {
                    block: this.block,
                    elem: 'input'
                },
                mods: { theme: 'islands', size: 'l' },
                placeholder: 'Введите запрос в DNS-shop',
                val: this.ctx.text
            }
        ];
    })
);
