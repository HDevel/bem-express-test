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
            { elem: 'meta', attrs: { name: 'apple-mobile-web-app-capable', content: 'yes' } },
            { elem: 'link', attrs: { rel: 'apple-touch-icon', href: 'data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAAJgAAACYCAMAAAAvHNATAAAAGXRFWHRTb2Z0d2FyZQBBZG9iZSBJbWFnZVJlYWR5ccllPAAAAyppVFh0WE1MOmNvbS5hZG9iZS54bXAAAAAAADw/eHBhY2tldCBiZWdpbj0i77u/IiBpZD0iVzVNME1wQ2VoaUh6cmVTek5UY3prYzlkIj8+IDx4OnhtcG1ldGEgeG1sbnM6eD0iYWRvYmU6bnM6bWV0YS8iIHg6eG1wdGs9IkFkb2JlIFhNUCBDb3JlIDUuNi1jMTMyIDc5LjE1OTI4NCwgMjAxNi8wNC8xOS0xMzoxMzo0MCAgICAgICAgIj4gPHJkZjpSREYgeG1sbnM6cmRmPSJodHRwOi8vd3d3LnczLm9yZy8xOTk5LzAyLzIyLXJkZi1zeW50YXgtbnMjIj4gPHJkZjpEZXNjcmlwdGlvbiByZGY6YWJvdXQ9IiIgeG1sbnM6eG1wPSJodHRwOi8vbnMuYWRvYmUuY29tL3hhcC8xLjAvIiB4bWxuczp4bXBNTT0iaHR0cDovL25zLmFkb2JlLmNvbS94YXAvMS4wL21tLyIgeG1sbnM6c3RSZWY9Imh0dHA6Ly9ucy5hZG9iZS5jb20veGFwLzEuMC9zVHlwZS9SZXNvdXJjZVJlZiMiIHhtcDpDcmVhdG9yVG9vbD0iQWRvYmUgUGhvdG9zaG9wIENDIDIwMTUuNSAoTWFjaW50b3NoKSIgeG1wTU06SW5zdGFuY2VJRD0ieG1wLmlpZDpDQzY4NDY2OTdCMUUxMUU2QjYwRTk3NEQzODc0NTM5MiIgeG1wTU06RG9jdW1lbnRJRD0ieG1wLmRpZDpDQzY4NDY2QTdCMUUxMUU2QjYwRTk3NEQzODc0NTM5MiI+IDx4bXBNTTpEZXJpdmVkRnJvbSBzdFJlZjppbnN0YW5jZUlEPSJ4bXAuaWlkOkNDNjg0NjY3N0IxRTExRTZCNjBFOTc0RDM4NzQ1MzkyIiBzdFJlZjpkb2N1bWVudElEPSJ4bXAuZGlkOkNDNjg0NjY4N0IxRTExRTZCNjBFOTc0RDM4NzQ1MzkyIi8+IDwvcmRmOkRlc2NyaXB0aW9uPiA8L3JkZjpSREY+IDwveDp4bXBtZXRhPiA8P3hwYWNrZXQgZW5kPSJyIj8+yotAZAAAADBQTFRF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' } },
            { elem: 'meta', attrs: { property: 'og:type', content: 'website' } },
            { elem : 'meta', attrs : { name : 'viewport', content : 'width=device-width, initial-scale=1' } }
        ],
        mods: {
            theme: 'islands',
            view: data.view
        }
    };
});
