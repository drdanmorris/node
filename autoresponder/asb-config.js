import { readFileSync, existsSync } from 'fs'
import { ISAM } from './__env.js'

/*
example config:

{
    "featureName": "feature.name",
    "junction": "foo",
    "projectRoot": "/Users/me/projects",
    "bundleType" : "chunked"
}

*/

export function getConfigFor(app, env) {
    const configPath = `${process.cwd()}/__config/${app}.json`
    const isam = env === 'fst' ? ISAM.fst :  ISAM.qa
    
    if (existsSync(configPath)) {
        const configFile = readFileSync(configPath, {"encoding": "utf-8"})

        try {
            const envConfig = JSON.parse(configFile)
            const config = {
                buildDir: '',
                launchUrl: `https://${isam}/${envConfig.junction}`,
                replacements: envConfig.replacements || {},
                bundleType : envConfig.bundleType,
                interceptPattern: envConfig.interceptPattern || `https://${isam}/features/${envConfig.featureName}`
            }

            if (envConfig.featureName && envConfig.projectRoot) {
                config.buildDir = `${envConfig.projectRoot}/${envConfig.featureName}/Feature/${envConfig.featureName}/build`
            }

            console.log('config', config)
            return config
        } catch(err) {
            console.log(err)
        }
    } else {
        console.log(`Could not find config file at path ${configFile}`)
    }

    return undefined
}