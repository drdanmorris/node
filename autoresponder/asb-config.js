import { readFileSync, existsSync } from 'fs'

const baseConfig = {
    isam: {
        fst: 'webappisamdev.asbbank.co.nz',
        qa: 'qaonline.asb.co.nz',
        prod: 'online.asb.co.nz'
    }
}

export function getConfigFor(app, env) {
    const configPath = `${process.cwd()}/${app}/${env}.json`

    if (existsSync(configPath)) {
        const configFile = readFileSync(configPath, {"encoding": "utf-8"})

        try {
            const envConfig = JSON.parse(configFile)
            const isam = baseConfig.isam[env]
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