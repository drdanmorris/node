import * as fs from 'fs'
import { readFile } from './file-utils.js'

export function parseDirty(srcFile) {
    // parse array of objects from file that may contain noise between objects
    if (!fs.existsSync(srcFile)) {
        return []
    }
    let mode = 0
    let currentReportLines = []
    const objects = []
    readFile(srcFile).split('\n').forEach(l => {
        const line = l.trim()
        if (line === '{') {
            mode = 1
            currentReportLines = []
        }
        if (mode === 1) {
            currentReportLines.push(line)
        }
        if (line === '}') {
            mode = 0
            const reportLines = currentReportLines.join('')
            objects.push(JSON.parse(reportLines))
        }
    })
    return objects
}

export function parseArray(srcFile) {
    const txt = readFile(srcFile).trim().split('\n').join('').replace(/\}\{/g, '},{')
    if (!txt.startsWith('[')) {
        return JSON.parse(`[${txt}]`)
    }
    return JSON.parse(txt)
}