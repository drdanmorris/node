import {start} from './interceptor.js'
import { initReplacementMap, getReplacementBodyFor } from './replacement-map.js'
import { getConfigFor } from './asb-config.js'
import { mapBundleFiles } from './bundle.js'
import { auditInterception } from './intercept-audit.js'
import * as fs from 'fs'

const app = 'map'
const env = 'fst'
const config = getConfigFor(app, env)
const configUrl = 'https://webappisamdev.asbbank.co.nz/container/v4/configuration'

if (config) {
    let fileMap = initReplacementMap(config)
    if (config.buildDir) { mapBundleFiles(config, fileMap) }

    console.log(fileMap)

    const interceptionPatterns = []

    if (config.interceptPattern) {
        interceptionPatterns.push({
            urlPattern: `${config.interceptPattern}/*`,
            resourceType: "Script"
        })
        interceptionPatterns.push({
            urlPattern: `${config.interceptPattern}/*`,
            resourceType: "Stylesheet"
        })
    }

    interceptionPatterns.push({
        urlPattern: configUrl,
        resourceType: "XHR"
    })

    const enabled = true

    if (enabled) {
        fs.writeFileSync('./__fileMap.json', JSON.stringify(fileMap, undefined, 2))
        start(config.launchUrl, (url) => {
            if (configUrl === url) {
                console.log('Returning stub configuration')
                return fs.readFileSync('__configuration.json', {"encoding": "utf-8"})
            } 

            const newBody = getReplacementBodyFor(url, fileMap)
            //auditInterception(url, typeof newBody !== 'undefined')
            return newBody
            
        }, interceptionPatterns)

        process.openStdin().addListener("data", (d) => {
            const cmd = d.toString().replace('/n', '').trim()

            if (cmd === 'remap') {
                console.log('Remapping Build Files...')
                mapBundleFiles(config, fileMap)
                console.log(fileMap)
            }
        })


    }
}


