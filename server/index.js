Object.assign || (Object.assign = require('object-assign'));

var fs = require('fs'),
    path = require('path'),
    express = require('express'),
    app = express(),
    bodyParser = require('body-parser'),
    favicon = require('serve-favicon'),
    morgan = require('morgan'),
    serveStatic = require('serve-static'),
    cookieParser = require('cookie-parser'),
    expressSession = require('express-session'),
    slashes = require('connect-slashes'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    csrf = require('csurf'),
    compression = require('compression'),

    config = require('./config'),
    staticFolder = config.staticFolder,

    getData = require('./get-data'),
    Render = require('./render'),
    render = Render.render,
    dropCache = Render.dropCache,

    port = process.env.PORT || config.defaultPort,
    isSocket = isNaN(port),
    isDev = process.env.NODE_ENV === 'development';

app
    .disable('x-powered-by')
    .enable('trust proxy')
    .use(compression())
    .use(favicon(path.join(staticFolder, 'favicon.ico')))
    .use(serveStatic(staticFolder))
    .use(morgan('combined'))
    .use(cookieParser())
    .use(bodyParser.urlencoded({ extended: true }))
    .use(expressSession({
        resave: true,
        saveUninitialized: true,
        secret: config.sessionSecret
    }))
    .use(passport.initialize())
    .use(passport.session())
    .use(csrf())
    .use(slashes());

passport.serializeUser(function(user, done) {
    done(null, JSON.stringify(user));
});

passport.deserializeUser(function(user, done) {
    done(null, JSON.parse(user));
});

app.get('/ping/', function(req, res) {
    res.send('ok');
});

app.get('/', function(req, res) {
    if (req.query.text) {
        req.query.text = req.query.text.replace(/[*\[\](+)]/g, '');
    }

    getData(req, function(items) {
        render(req, res, {
            view: 'index',
            title: 'Цены',
            meta: {
                description: 'Трекер цен'
            },
            items: items,
            current: 100 * Number(fs.readFileSync('./dns-save/.current-progress')),
            query: req.query
        });
    });
});

app.get('/search', function(req, res) {
    var current = 100 * Number(fs.readFileSync('./dns-save/.current-progress'));

    getData(req, function(items) {
        render(req, res, null, ['Найдено: ' + items.length + (current ? '; Обновление: ' + current.toFixed(1) + '%' : ''), items]);
    });
});

app.get('*', function(req, res) {
    res.status(404);
    return render(req, res, { view: '404' });
});

if (isDev) {
    app.get('/error/', function() {
        throw new Error('Uncaught exception from /error');
    });

    app.use(require('errorhandler')());
}

isSocket && fs.existsSync(port) && fs.unlinkSync(port);

app.listen(port, function() {
    isSocket && fs.chmod(port, '0777');
    console.log('server is listening on', this.address().port);
});
