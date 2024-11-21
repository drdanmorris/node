import * as fs from 'fs'
import * as path from 'path'
import { getAbsNameFor } from './bundle.js'


export function initReplacementMap(config) {
  const {replacements, buildDir} = config
  const fileMap = {}
  if (Object.keys(replacements).length) {
    for (const target in replacements) {
      const replacement = replacements[target]
      const targetPath = path.join(buildDir, replacement)
      if (fs.existsSync(targetPath)) {
        fileMap[target] = targetPath
      } else {
        console.log(`Replacement file ${replacements[target]} not found at ${targetPath}`)
      }
    }
  }
  return fileMap
}

export function getReplacementBodyFor(url, fileMap) {
    const localPath = getLocalPathFromFileMap(url, fileMap)
    if (localPath && fs.existsSync(localPath)) {
        console.log(`Replacing content for ${url.split('/').pop()}`)
        return fs.readFileSync(localPath)
    }
    return undefined
}

function getLocalPathFromFileMap(url, fileMap) {
  url = url.split('?')[0]
  const filename = getAbsNameFor(url)
  if(filename) {
    return fileMap[filename] || ''
  } else {
    for (const target in fileMap) {
      if (url.endsWith(target)) {
        return fileMap[target]
      }
    }
  }
  return ''
}

function getApiPayload(url) {
  if (url.includes('/api/')) {
        const parts = url.split('/api/')
        const key = parts[1].replace(/\//g, '_')
        if(apiMap[key]) {
            return fs.readFileSync(`./api/${apiMap[key]}`, {encoding:'utf-8'})
        }
    }
}
