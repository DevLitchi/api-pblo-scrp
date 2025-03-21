/*global document*/
var html = require("unpack-html")

    , populate = require("../..")
    , property = require("../../property")
    , textContent = require("../../textContent")
    , template = require("./template.html")

// Generate an object of DOM element references to populate
// You can use something other then unpack-html!
var elements = html(template)
var data = {
    someText: "this is some text"
    , someLink: "http://google.com"
    , value: "you can map to other elements"
    , name: [
        "one"
        , "two"
        , "three"
    ]
}

// populate a data structure onto an object of elements through
// some mapping!
populate(data, elements, {
    // Set textContent of elements.someText to data.someText
    someText: textContent
    // Set href of elements.someLink to data.someLink
    , someLink: property("href")
    // Set value of elements.different to data.value
    , value: property("value", "different")
    // Custom logic. Mappings are just functions, do anything
    // you want!
    , name: function (value, elem, elements) {
        var tmpl = elem.firstElementChild
        elem.removeChild(tmpl)

        value.forEach(function (text) {
            var clone = tmpl.cloneNode(true)
            clone.textContent = text
            elem.appendChild(clone)
        })
    }
})

document.body.appendChild(elements.root)
