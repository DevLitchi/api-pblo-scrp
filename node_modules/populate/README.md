# populate

Populate DOM elements with data

## Simple Example

The idea is that you take a pair of data and DOM elements and
    apply a mapping from the data onto the DOM.

```js
var populate = require("populate")
    , property = require("populate/property")
    , textContent = require("populate/textContent")

var elements = {
    root: document.createElement("div")
    , text: document.createElement("span")
    , link: document.createElement("a")
}

populate({
    text: "some text goes in span!"
    , link: "http://google.com"
}, elements, {
    text: textContent
    , link: property("href")
})

elements.root.appendChild(elements.text)
elements.root.appendChild(elements.link)
document.body.appendChild(elements.root)
```

The above mapping placed the link into the `<a>`'s href property
    and placed the text into the `<span>`'s textContent.

## Complex Example

The format of an object of elements allows you to populate
    multiple elements from a single object of data.

It also works cleanly with the result of [`unpack-html`][1].
    However using [`unpack-html`][1] is completely optional.
    Feel free to get references to your DOM elements however
    you want!

```html
<!-- ./template.html -->
<div>
    <div id="someText"></div>
    <div>
        <a id="someLink">I am a link</a>
    </div>
    <div>
        <textarea id="different"></textarea>
    </div>
    <ul id="name">
        <li>Im a nested template or something</li>
    </ul>
</div>
```

```js
var html = require("unpack-html")
    , populate = require("populate")
    , property = require("populate/property")
    , textContent = require("populate/textContent")

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

populate(data, elements, {
    someText: textContent
    , someLink: property("href")
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
```

Compared to doign it by hand

```js
...

elements.someText.textContent = data.someText
elements.someLink.href = data.someLink
elements.different.value = data.value
var tmpl = elements.name.firstElementChild
elements.name.removeChild(tmpl)
data.name.forEach(function (text) {
    var clone = tmpl.cloneNode(true)
    clone.textContent = text
    elem.appendChild(clone)
})

document.body.appendChild(elements.root)
```

You don't safe much boilerplate but what you gain is a
    declarative description of how your data structure populates
    the DOM. Which doubles as documenting your data structure and
    defining how the rendering logic should be done.

## Advantages

 - declaratively describe your data structure
 - declaratively describe how the DOM should be populated
 - uses functions and recursions so is both modular and
    composable
 - Works nicely with streams

## Stream example

```html
<!-- ./template.html -->
<div>
    <div>Name: <span id="name"></span></div>
    <div>Value: <span id="value"></span></div>
</div>
```

```js
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
```

## Docs

### `var elements = populate(data, elements, mapping)`

populate the `elements` with the supplied `data` and `mapping`.

populate returns the `elements` you pass in for convenience.

`mapping` is expected to be an object with string keys
    and function values.

For each key it will find `data[key]` and `elements[key]`, then
    it calls `mapping(data[key], elements[key], elements)`

This means your mapping might look like:

```js
var populate = require("populate")

populate({ text: "hello" }, elements, {
    text: function (value, element) {
        element.textContent = value
    }
})
```

The above example function is actually the same as
    `populate/textContent` and this is the simplest way to use
    populate.

The value in the mapping object doesn't actually have to be
    a function. It can also be an array.

Let's say you have a link to a users page and you want to
    populate both the users profile image and his name with that
    link so he can click either and it redirects him.

```js
var populate = require("populate")

populate({ userLink: someUri }, elements, {
    userLink: [function (value, _, elements) {
        elements.profileImageWrapper.href = value
    }, function (value, _, elements) {
        elements.userNameLink.href = value
    }]
})
```

Finally you can also supply an object as the value and populate
    will just recurs

```js
var populate = require("populate")
    , textContent = require("populate/textContent")

populate({
    user: {
        name: "Steve"
    }
}, elements, {
    user: {
        name: textContent
    }
})
```

### `textContent`

textContent is the simplest function you can use in a mapping.
    It basically says map the value to the elements textContent

```js
var populate = require("populate")
    , textContent = require("populate/textContent")
    , assert = require("assert")

var elements = populate({
    text: "foo"
}, {
    text: document.createElement("span")
}, {
    text: textContent
})

assert.equal(elements.text.textContent, "foo")
```

### `property(prop[, name])`

property is a slightly more flexible function that can be used
    in mapping. It maps the value to an elements property.

It takes an optional name property so that your elements keys
    can have different names from your data structure

```js
var populate = require("populate")
    , textContent = require("populate/textContent")
    , assert = require("assert")

var elements = populate({
    link: "http://google.com"
}, {
    link: document.createElement("a")
}, {
    text: property("src")
})

assert.equal(elements.text.textContent, "http://google.com")
```

## Installation

`npm install populate`

## Contributors

 - Raynos

## MIT Licenced

  [1]: https://github.com/Raynos/unpack-html
