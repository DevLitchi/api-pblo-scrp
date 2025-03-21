var keys = Object.keys

module.exports = populate

function populate(data, elements, mapping) {
    keys(mapping).forEach(applyMapping)

    return elements

    function applyMapping(prop) {
        var value = data[prop]
            , map = mapping[prop]

        if (Array.isArray(map)) {
            map.forEach(function (fn) {
                fn(value, elements[prop], elements)
            })
        } else if (typeof map === "object") {
            populate(value, elements, map)
        } else {
            map(value, elements[prop], elements)
        }
    }
}
