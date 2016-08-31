var options = {
    from: '--from -f'
};

for (var opt in options) {
    var aliases = options[opt].split(' ');

    options[opt] = undefined;

    aliases.forEach(function(o) {
        var index = process.argv.indexOf(o),
            value;

        if (index >= 0) {
            value = process.argv[index + 1];
            options[opt] = Number(value) || value;
        }
    });
}

module.exports = options;