import { DOMImplementation, XMLSerializer } from 'xmldom'

const ns = 'http://www.w3.org/2000/svg'

let document

export function createSvg() {
    document = new DOMImplementation().createDocument('http://www.w3.org/1999/xhtml', 'html', null)
    const svg = document.createElementNS(ns, 'svg')
    svg.appendChild(getDefs())
    svg.appendChild(getStyle())
    return svg
}

export function getRect(ctx, fill) {
    const {x, y, width, height} = ctx
    const rect = document.createElementNS(ns, 'rect')
    rect.setAttribute('x', x)
    rect.setAttribute('y', y)
    rect.setAttribute('width', width)
    rect.setAttribute('height', height)
    rect.setAttribute('fill', fill)
    return rect
}

export function getCircle(ctx, fill) {
    const {x, y, width} = ctx
    const circle = document.createElementNS(ns, 'circle')
    circle.setAttribute('cx', x)
    circle.setAttribute('cy', y)
    circle.setAttribute('r', width)
    circle.setAttribute('fill', fill)
    return circle
}

export function getText(point, text, className) {
    const {x, y} = point
    const txt = document.createElementNS(ns, 'text')
    txt.setAttribute('x', x)
    txt.setAttribute('y', y)
    className && txt.setAttribute('class', className)
    txt.textContent = text
    return txt
}

export function getLine(points) {
    const {x1, y1, x2, y2} = points
    const line = document.createElementNS(ns, 'line')
    line.setAttribute('x1', x1)
    line.setAttribute('y1', y1)
    line.setAttribute('x2', x2)
    line.setAttribute('y2', y2)
    line.setAttribute('stroke', 'black')
    return line
}

export function getArrow(points) {
    const line = getLine(points)
    line.setAttribute('marker-end', 'url(#arrowhead)')
    return line
}

export function getPath(d, stroke) {
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', d)
    path.setAttribute('stroke', stroke || 'black')
    path.setAttribute('fill', 'transparent')
    path.setAttribute('marker-end', 'url(#arrowhead)')
    return path
}

export function getXml(svg) {
    return new XMLSerializer().serializeToString(svg)
}


function getDefs() {
    const marker = document.createElementNS(ns, 'marker')
    marker.setAttribute('id', 'arrowhead')
    marker.setAttribute('viewBox', '0 0 10 10')
    marker.setAttribute('refX', '5')
    marker.setAttribute('refY', '5')
    marker.setAttribute('markerWidth', '6')
    marker.setAttribute('markerHeight', '6')
    marker.setAttribute('orient', 'auto-start-reverse')
    const path = document.createElementNS(ns, 'path')
    path.setAttribute('d', 'M 0 0 L 10 5 L 0 10 z')
    marker.appendChild(path)
    const defs = document.createElementNS(ns, 'defs')
    defs.appendChild(marker)
    return defs
}

function getStyle() {
    const style = document.createElementNS(ns, 'style')
    style.textContent = `
    .small-text {font: 10px sans-serif;}
    .badge-text {font: 11px sans-serif;fill: white;}
    `
    return style
}