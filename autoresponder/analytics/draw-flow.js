import { writeFile } from './file-utils.js'
import { createSvg, getRect, getText, getXml, getCircle, getPath } from './svg.js'
import { getHLinePath, getVLinePath } from './arrow.js'
import { dimension } from './dimension.js'
import { colour } from './colour.js'
import { place } from './page-placement.js'

function getTimestampBadge(placement, ts) {
    const width = 14
    const x = placement.right - width/2
    const y = placement.y + width/2
    const len = ts.toString().length
    const offsetX = len * 3

    return [
        getCircle({width, x, y}, '#dd0000'), 
        getText({
            x: placement.right - width/2 - offsetX,
            y: placement.y + width/2 + 4
        }, ts, 'badge-text')
    ]
}

function getPageRect(placement) {
    const width = placement.width
    const height = placement.height
    const name = placement.step.pageName.toLowerCase()
    let fill = colour.page

    if (name === 'tool start') { fill =  colour.toolStart }
    else if (name === 'tool end') { fill =  colour.toolEnd }

    const rect = getRect({width, height, x: placement.x, y: placement.y}, fill)
    const text = getPageText(placement)
    return [rect, text]
}

function getPageText(placement) {
    return getText({
        x: placement.x + 5,
        y: placement.y + 30
    }, placement.step.pageName)
}

function getPageCtxRect(placement) {
    const width = placement.width - dimension.offset*2
    const height = dimension.rect.pageCtx.height
    return getRect({width, height, x: placement.x + dimension.offset, y: placement.y + dimension.rect.page.height - dimension.offset}, colour.pageCtx)
}

function getInteractionRect(interaction) {
    const width = interaction.width
    const height = interaction.height
    const rect = getRect({width, height, x: interaction.x, y: interaction.y}, colour.interaction)
    const text = getInteractionText(interaction)
    return [rect, ...text]
}

function getInteractionText(interaction) {
    const elements = []
    elements.push (getText({
        x: interaction.x + 5,
        y: interaction.y + 20
    }, `${interaction.interaction.type} interaction`))
    elements.push (getText({
        x: interaction.x + 5,
        y: interaction.y + 40
    }, interaction.interaction.text))

    return elements
}

function getPageCtxText(placement) {
    return getText({
        x: placement.x + 5,
        y: placement.y + dimension.rect.page.height + 20
    }, placement.step.context, 'small-text')
}

// export function place(flow) {
//     const MaxAllowedHeight = 800
//     const pages = []
//     const point = {x: dimension.margin, y: dimension.margin}
//     let id = 0
//     let maxRight = 0

//     flow.forEach(step => {
//         id++

//         if (point.y > MaxAllowedHeight && point.x < maxRight) {
//             point.x = maxRight + dimension.colSpacing
//             point.y = dimension.margin
//         }

//         const page = {
//             id,
//             x: point.x,
//             y: point.y,
//             width: dimension.rect.page.width,
//             height: dimension.rect.page.height,
//             interactions: []
//         }

//         if (step.context) {
//             page.height += dimension.rect.pageCtx.height
//         }

//         const pageNameWidth = step.pageName.length * dimension.rect.page.fontWidth
//         const pageContextLength = (step.context ? step.context.length : 0) * dimension.rect.pageCtx.fontWidth
//         page.width = Math.max(page.width, pageNameWidth, pageContextLength)
//         page.midX = page.x + page.width/2
//         page.midY = point.y + dimension.rect.page.height/2
//         page.bottom = point.y + page.height
//         page.right = page.x + page.width

//         if (step.interactions) {
//             let x = point.x + page.width + dimension.hspacing
//             step.interactions.forEach(interaction => {
//                 const interaction = {
//                     x,
//                     y: page.y,
//                     width: dimension.rect.interaction.width,
//                     height: dimension.rect.interaction.height,
//                     interaction,
//                     spaceLeft: {
//                         x1: x - dimension.hspacing,
//                         x2: x - 2
//                     }
//                 }

//                 interaction.width = Math.max(interaction.width, interaction.text.length * dimension.rect.interaction.fontWidth)
//                 interaction.midY = interaction.y + interaction.height/2
//                 interaction.bottom = interaction.y + interaction.height
//                 interaction.midX = interaction.x + interaction.width/2
//                 interaction.right = interaction.x + interaction.width

//                 x += (interaction.width + dimension.hspacing)
//                 page.interactions.push(interaction)
//                 maxRight = Math.max(maxRight, interaction.right)
//             })
//         }

//         page.step = step
//         pages.push(page)
//         point.y = page.bottom + dimension.vspacing
//     })
//     writeFile("__placement.json", JSON.stringify(pages, undefined, 2))
//     return pages
// }

export function draw(flow) {
    const pages = place(flow)
    const svg = createSvg()
    const numPlacements = pages.length
    
    pages.forEach(page => {
        getPageRect(page).forEach(el => svg.appendChild(el))
        getTimestampBadge(page, page.step.time).forEach(el => svg.appendChild(el))

        if (page.step.context) {
            svg.appendChild(getPageCtxRect(page))
            svg.appendChild(getPageCtxText(page))
        }

        page.interactions.forEach(interaction => {
            const d = getHLinePath(interaction)
            svg.appendChild(getPath(d, '#808080'))
            getInteractionRect(interaction).forEach(el => svg.appendChild(el))
            getTimestampBadge(interaction, interaction.interaction.time).forEach(el => svg.appendChild(el))
        })

        if (page.id < numPlacements) {
            const nextPlacement = pages[page.id]
            const d = getVLinePath(page, nextPlacement)
            svg.appendChild(getPath(d, '#606060'))
        }

    })

    writeFile("__flow.svg", getXml(svg))
}


