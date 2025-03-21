/*global document*/
var html = require("unpack-html")

    , PopulateStream = require("../../stream")
    , textContent = require("../../textContent")
    , template = require("./template.html")

var elements = html(template)
var stream = PopulateStream(elements, {
    value: textContent
    , name: textContent
})

var name = "Streaming population!"
var value = 0

setInterval(function () {
    value++
    stream.write({
        name: name
        , value: value
    })
}, 500)

document.body.appendChild(elements.root)
