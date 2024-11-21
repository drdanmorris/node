import { draw } from './draw-flow.js'
import * as fs from 'fs'
import { parseArray } from '../json-helper.js'
import { getTimestampFrom, getTimestampDeltaFor } from './analytics-helper.js'

let refTs

export function deriveFlow(reports) {
    const flow = []
    
    reports.forEach((report, i) => {
        if (i === 0) {
            initTsFrom(report)
        }
        if (/\bevent1\b/.test(report.events)) {
            if (report.events === "event1") {
                const parts = report.pageName.split(":")
                flow.push({
                    pageName: parts[parts.length-1]
                })
            } else if (report.events.includes("event21")) {
                flow.push({
                    pageName: 'Tool Start'
                })
            } else if (report.events.includes("event22")) {
                flow.push({
                    pageName: 'Tool End'
                })
            }

            if (report.v15) {
                flow[flow.length-1].context = report.v15
            }

            flow[flow.length-1].time = getTimestampDeltaFor(report, refTs)
        }
        else if (report.events === "event18") {
            flow[flow.length-1].interactions = flow[flow.length-1].interactions || []
            const parts = report.v18.split('|')
            const interaction = {
                type: parts[1],
                text: parts[parts.length-1],
                time: getTimestampDeltaFor(report, refTs)
            }
            flow[flow.length-1].interactions.push(interaction)
        }
        
    })
    fs.writeFileSync('__flow.txt', JSON.stringify(flow, undefined, 2))
    return flow
}

function initTsFrom(report) {
    refTs = getTimestampFrom(report)
}

export function drawFlow(reports) {
    reports = reports || parseArray('__visit.txt')
    if (reports) {
        const flow = deriveFlow(reports)
        draw(flow)
    }
    
}

drawFlow()


