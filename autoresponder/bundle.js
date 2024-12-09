import * as fs from 'fs'
import * as path from 'path'

const jsBundleRex = /^(main|\d)\.[a-z0-9]+\.chunk\.(js|css)$/

export function getAbsNameFor(url) {
    const filename = url.split('/').pop()
    const match = jsBundleRex.exec(filename)
    if(match && match.length > 2) {
        const chunk = match[1]
        const ext = match[2]
        return `${chunk}.${ext}`
    }
    return ''
}

export function mapBundleFiles(config, fileMap) {
    mapBundleFilesIn(config, 'js', fileMap)
    mapBundleFilesIn(config, 'css', fileMap)
    //mapBundleFilesIn(config, 'html', fileMap)  // no can do
}
  
function mapBundleFilesIn(config, fileType, fileMap) {
    const {buildDir, bundleType} = config
    const isChunked = bundleType == 'chunked' && fileType !== 'html'
    let subDirPath = buildDir

    if (isChunked) {
        subDirPath = path.join(subDirPath, 'static', fileType)
    }

    const files = fs.readdirSync(subDirPath, {withFileTypes: true})
        .filter(item => !item.isDirectory())
        .map(item => item.name)

    files.forEach(f => {
        if (isChunked) {
            const filename = getAbsNameFor(f)
            filename && (fileMap[filename] = path.join(subDirPath, f))
        } else {
            
            if (f.endsWith(fileType)) {
                fileMap[f] = path.join(subDirPath, f)
            }
        }
    })
}
  