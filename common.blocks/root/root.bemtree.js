block('root').replace()(function() {
    var ctx = this.ctx,
        data = this.data = ctx.data,
        meta = data.meta || {},
        og = meta.og || {};

    if (ctx.context) return ctx.context;

    return {
        block: 'page',
        title: data.title,
        favicon: '/favicon.ico',
        styles: [
            {
                elem: 'css',
                url: '/index.min.css'
            }
        ],
        scripts: [
            {
                elem: 'js',
                url: '/index.min.js'
            }
        ],
        head: [
            { elem: 'meta', attrs: { name: 'description', content: meta.description } },
            { elem: 'meta', attrs: { property: 'og:title', content: og.title || data.title } },
            { elem: 'meta', attrs: { property: 'og:url', content: og.url } },
            { elem: 'meta', attrs: { property: 'og:site_name', content: og.siteName } },
            { elem: 'meta', attrs: { property: 'og:locale', content: og.locale || 'en_US' } },
            { elem: 'meta', attrs: { name: 'format-detection', content: 'telephone=no' } },
            { elem: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
            { elem: 'link', attrs: { rel: 'apple-touch-icon', href: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACYCAMAAAAvHNATAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wTU09Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9tbS8iIHhtbG5zOnN0UmVmPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvc1R5cGUvUmVzb3VyY2VSZWYjIiB4bWxuczp4bXA9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC8iIHhtcE1NOkRvY3VtZW50SUQ9InhtcC5kaWQ6NTBDMzhGQzk4Q0M4MTFFNjk4NzlGM0Y2NEQyQkY2N0IiIHhtcE1NOkluc3RhbmNlSUQ9InhtcC5paWQ6NTBDMzhGQzg4Q0M4MTFFNjk4NzlGM0Y2NEQyQkY2N0IiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOjVDODU0RkY5OENDNzExRTY5ODc5RjNGNjREMkJGNjdCIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOjVDODU0RkZBOENDNzExRTY5ODc5RjNGNjREMkJGNjdCIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+H/LowgAAAGBQTFRF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' } },
            { elem: 'meta', attrs: { property: 'og:type', content: 'website' } },
            { elem : 'meta', attrs : { name : 'viewport', content : 'initial-scale=1, maximum-scale=1, minimum-scale=1, user-scalable=0' } }
        ],
        mods: {
            theme: 'islands',
            view: data.view
        }
    };
});
