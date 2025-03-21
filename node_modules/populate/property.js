module.exports = property

function property(property, name) {
    return function (value, elem, elements) {
        if (name) {
            elem = elements[name]
        }

        elem && (elem[property] = value)
    }
}
