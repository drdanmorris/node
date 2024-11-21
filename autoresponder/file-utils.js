import * as fs from 'fs'
import { getDate } from './date-utils.js'

export function appendFile(name, entry) {
    const localPath = `./${name}`
    // if (!fs.existsSync(localPath)) {
    //     fs.writeFileSync(localPath, getDate() + '\n')
    // }
    fs.appendFileSync(localPath, entry + '\n')
}

export function writeFile(name, entry) {
    const localPath = `./${name}`
    fs.writeFileSync(localPath, entry)
}

export function deleteFile(name) {
    const localPath = `./${name}`
    if (fs.existsSync(localPath)) {
        fs.unlinkSync(localPath)
    }
}

export function readFile(name) {
    const localPath = `./${name}`
    if (fs.existsSync(localPath)) {
        return fs.readFileSync(localPath, {encoding: 'utf-8'})
    }
}