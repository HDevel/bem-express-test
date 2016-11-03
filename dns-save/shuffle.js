module.exports = function shuffle(array) {
    var length = array.length;

    for (var i = 0; i < length; i++) {
        var rnd = Math.floor(Math.random() * length);
        var tmp = array[i];
        array[i] = array[rnd];
        array[rnd] = tmp;
    }

    return array;
};
