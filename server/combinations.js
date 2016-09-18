module.exports = function(string) {
    var arr = string.toLowerCase().split(' '),
        reg = [],
        selector = '';

    arr.forEach(function(v1, i1) {
        arr.forEach(function(v2, i2) {
            arr[i1] = v2;
            arr[i2] = v1;

            arr.forEach(function() {
                arr.push(arr.shift());

                selector = arr.join('.+');

                if (reg.indexOf(selector) === -1) {
                    reg.push(selector);
                }
            });

            arr[i1] = v1;
            arr[i2] = v2;
        });
    });

    return reg.join('|');
};

