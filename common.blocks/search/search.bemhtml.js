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
                mods: { theme: 'islands', size: 'm' },
                placeholder: 'Введите имя',
                val: this.ctx.text
            }
        ];
    })
);
