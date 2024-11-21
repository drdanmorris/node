import {start} from './interceptor.js'
import { initReplacementMap, getReplacementBodyFor } from './replacement-map.js'

console.clear()
const replacements = {}
const launchUrl = ''
const fileMap = initReplacementMap(replacements)
launchUrl && Object.keys(replacements).length && start(launchUrl, (url) => {
    return getReplacementBodyFor(ulr, fileMap)
})


