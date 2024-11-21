import { start } from '../interceptor.js'
import { appendFile, deleteFile } from '../file-utils.js'
import { drawFlow } from './flow.js'

const launchUrlFST = 'https://webappisamdev.asbbank.co.nz/fnc104'
const launchUrlQA = 'https://qaonline.asb.co.nz/fnc1'
const launchUrl = launchUrlQA

const interceptPatterns = [{
    urlPattern: "https://visit.asb.co.nz/*",
    resourceType: "Script"
}]
const reports = []
const fields = []
const logfile = '__visit.txt'
const diffsFile = '__diffs.txt'

function processUrl(url) {
    url = url.trim()
    if(/s\d{12,16}?/.test(url)) {
        url = url.replace(/%20/g, ' ')
        url = url.replace(/%3A/g, ':')
        url = url.replace(/%2F/g, '/')
        url = url.replace(/%3D/g, '=')
        url = url.replace(/%7C/g, '|')
        url = url.replace(/%40/g, '@')
        url = url.replace(/%2C/g, ',')
    }
    return url
}

const fieldsToIgnore = ['t', 'lrt', 'pev2', 'v8', 'v69', 'c18', 'c16', 'v16']

function reportDiffs(logToConsole) {
    console.clear()
    deleteFile(diffsFile)

    if (reports.length > 1) {
        const fieldsToReport = []
        fields.forEach(field => {
            let vals = []
            reports.forEach(report => {
                if (typeof report === 'object') {
                    const curVal = report[field]
                    if (curVal && !vals.includes(curVal)) { vals.push(curVal) }
                }
            })
            if (vals.length > 1 && !fieldsToIgnore.includes(field)) { fieldsToReport.push(field) }
        })

        if (fieldsToReport.length > 1) {
            reports.forEach(report => {
                if (typeof report === 'string') {
                    appendFile(diffsFile, report)
                    logToConsole && console.log(report)
                } else  {
                    const filtered = {}
                    fieldsToReport.forEach(field => {
                        if(report[field]) {
                            filtered[field] = report[field]
                        }
                    })
                    appendFile(diffsFile, JSON.stringify(filtered, undefined, 2))
                    logToConsole && console.log(filtered)
                }
            })
        }
    }
}

function reportVisit(url) {
    if (url.includes('?')) {
        const parts = url.split('?')[1].split('&')
        const report = {}
        parts.forEach(part => {
            const kvp = part.split('=')
            if (kvp.length === 2) {
                const field = kvp[0].replace('&', '')
                report[field] = kvp[1]
                if (!fields.includes(field)) { fields.push(field)}
            }
        })
        reports.push(report)
        appendFile(logfile, JSON.stringify(report, undefined, 2))
        drawFlow(reports)
    }
}

async function handleRequest(url) {
    url = processUrl(url)
    reportVisit(url)
    reportDiffs()
}

console.clear()
deleteFile(logfile)
start(launchUrl, handleRequest, interceptPatterns)

// process.openStdin().addListener("data", (d) => {
//     const cmd = d.toString().replace('/n', '').trim()
// })




