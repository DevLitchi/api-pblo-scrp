module.exports = textContent

function textContent(value, elem) {
    elem && (elem.textContent = value)
}
