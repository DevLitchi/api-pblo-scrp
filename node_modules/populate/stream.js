var WriteStream = require("write-stream")
    , populate = require("./index")

module.exports = PopulateStream

function PopulateStream(elements, mapping) {
    return WriteStream(function (data) {
        populate(data, elements, mapping)
    })
}
