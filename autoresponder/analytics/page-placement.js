import { writeFile } from './file-utils.js'
import { dimension } from './dimension.js'

class InteractionPlacement {
    constructor(point, x) {
        this.x = x
        this.y = point.y
        this.width = dimension.rect.interaction.width
        this.height = dimension.rect.interaction.height
        this.spaceLeft = {
            x1: this.x - dimension.hspacing,
            x2: this.x - 2
        }
    }

    init(interaction) {
        this.width = Math.max(this.width, interaction.text.length * dimension.rect.interaction.fontWidth)
        this.midY = this.y + this.height/2
        this.bottom = this.y + this.height
        this.midX = this.x + this.width/2
        this.right = this.x + this.width
        this.interaction = interaction
    }

}

class PagePlacement {
    constructor(id, point) {
        this.id = id
        this.x = point.x
        this.y = point.y
        this.width = dimension.rect.page.width
        this.height = dimension.rect.page.height
        this.interactions = []
    }

    init(step) {
        this.step = step

        if (step.context) {
            this.height += dimension.rect.pageCtx.height
        }

        const pageNameWidth = step.pageName.length * dimension.rect.page.fontWidth
        const pageContextLength = (step.context ? step.context.length : 0) * dimension.rect.pageCtx.fontWidth
        this.width = Math.max(this.width, pageNameWidth, pageContextLength)
        this.midX = this.x + this.width/2
        this.midY = this.y + dimension.rect.page.height/2
        this.bottom = this.y + this.height
        this.right = this.x + this.width
        
        if (step.interactions) {
            let x = this.x + this.width + dimension.hspacing
            const me = this

            step.interactions.forEach(interaction => {
                const interactionPlacement = new InteractionPlacement(this, x)
                interactionPlacement.init(interaction)
                me.interactions.push(interactionPlacement)
                x += (interactionPlacement.width + dimension.hspacing)
            })
        }
    }

    maxRight() {
        if (this.interactions.length) {
            return this.interactions[this.interactions.length-1].right
        }
        return this.right
    }
}

export function place(flow) {
    const MaxAllowedHeight = 800
    const pages = []
    const point = {x: dimension.margin, y: dimension.margin}
    let id = 0
    let maxRight = 0

    flow.forEach(step => {
        id++
        if (point.y > MaxAllowedHeight && point.x < maxRight) {
            point.x = maxRight + dimension.colSpacing
            point.y = dimension.margin
        }
        const page = new PagePlacement(id, point)
        page.init(step)
        pages.push(page)
        maxRight = Math.max(maxRight, page.maxRight())
        point.y = page.bottom + dimension.vspacing
    })
    writeFile("__placement.json", JSON.stringify(pages, undefined, 2))
    return pages
}



