export function getVLinePath(page, nextPage) {
    if (nextPage.x > page.x) {
        return getPagePageNextColArrow(page, nextPage)
    }
    if (page.interactions.length) {
        return getInteractionPageArrow(page, page.interactions[page.interactions.length-1], nextPage)
    }
    return getPagePageSameColArrow(page, nextPage)
}

export function getHLinePath(interaction) {
    return getPageInteractionArrow(interaction)
}

function getPageInteractionArrow(interaction) {
    const M = {
        x: interaction.spaceLeft.x1,
        y: interaction.y + interaction.height/2
    }
    const L = {
        x: interaction.spaceLeft.x2,
        y: interaction.y + interaction.height/2
    }
    return `M ${M.x} ${M.y} L ${L.x} ${L.y} `
}

function getInteractionPageArrow(page, interaction, nextPage) {
    /*         FROM
                |  L1
        ---------  L2
        |          L3
        v
        TO
    */
    const vSep = nextPage.y - page.bottom
    const M = {
        x: interaction.midX,
        y: interaction.bottom
    }
    const L1 = {
        x: interaction.midX,
        y: page.bottom + vSep/2
    } 
    const L2 = {
        x: nextPage.midX, 
        y: page.bottom + vSep/2
    }
    const L3 = {
        x: nextPage.midX, 
        y: nextPage.y - 2
    }
    return `M ${M.x} ${M.y} L ${L1.x} ${L1.y} L ${L2.x} ${L2.y} L ${L3.x} ${L3.y}`
}


function getPagePageSameColArrow(page, nextPage) {
    const vSep = nextPage.y - page.bottom
    const M = {
        x: page.midX, 
        y: page.bottom
    }
    const L = {
        x: page.midX, 
        y: page.bottom + vSep - 2
    }
    return `M ${M.x} ${M.y} L ${L.x} ${L.y} `
}

function getPagePageNextColArrow(page, nextPage) {
    /*              --> TO
                    |
                    | 
            FROM    |
            |       |
            ---------
    */

    

    const depthY = 20
    const depthX = 20
    const M = {
        x: page.midX,
        y: page.bottom
    }

    if (page.interactions.length) {
        const lastInteraction = page.interactions[page.interactions.length-1]
        M.x = lastInteraction.midX
        M.y = lastInteraction.bottom
    }

    const L1 = {
        x: M.x,
        y: page.bottom + depthY
    }
    const L2 = {
        x: nextPage.x - depthX - 2,
        y: page.bottom + depthY
    }
    const L3 = {
        x: nextPage.x - depthX - 2,
        y: nextPage.midY
    }
    const L4 = {
        x: nextPage.x - 2,
        y: nextPage.midY
    }
    const d = `M ${M.x} ${M.y} L ${L1.x} ${L1.y} L ${L2.x} ${L2.y} L ${L3.x} ${L3.y} L ${L4.x} ${L4.y}`
    return d
}



