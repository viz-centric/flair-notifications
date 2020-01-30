const yaml = require('js-yaml');
const fs = require('fs');
const logger = require('../logger');
const default_config = './app/jobs/notification_config.yml';

let appConfig;
let appConfigPromise;

function getConfig() {
    if (appConfigPromise) {
        return appConfigPromise;
    }

    appConfigPromise = new Promise(async (success, reject) => {
        if (appConfig) {
            logger.info(`Loading notification config. Already loaded.`);
            appConfigPromise = null;
            success(appConfig);
        }
        logger.info(`Loading notification config...`);
        const configFile = default_config;
        const AppConfig = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));
        appConfig = AppConfig;
        logger.info(`notification config loaded ${appConfig}`);
        appConfigPromise = null;
        success(appConfig);
    });

    return appConfigPromise;
}


module.exports = {
    getConfig
};
