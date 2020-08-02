const yaml = require('js-yaml');
const fs = require('fs');
const logger = require('./logger');
const localIpV4Address = require("local-ipv4-address");
const os = require("os");
const default_config = './app/default_config.yml';

let appConfig;
let appConfigPromise;
function getConfig() {
    if (appConfigPromise) {
        return appConfigPromise;
    }

    appConfigPromise = new Promise(async (success, reject) => {
        if (appConfig) {
            logger.info(`Loading app config. Already loaded.`);
            appConfigPromise = null;
            success(appConfig);
        }
        logger.info(`Loading app config...`);
        const configFile = process.env.APP_CONFIG || default_config;

        logger.debug(`config file name : ` + configFile);

        const AppConfig = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

        logger.debug(`config file details : ` + JSON.stringify(AppConfig));

        if (process.env.mailServiceAuthUser) {
            AppConfig.mailService.auth.user = process.env.mailServiceAuthUser;
        }
        if (process.env.mailServiceAuthPass) {
            AppConfig.mailService.auth.pass = process.env.mailServiceAuthPass;
        }
        if (process.env.EUREKA_URL) {
            AppConfig.discovery.eureka.url = process.env.EUREKA_URL;
        }
        if (process.env.GRPC_JWT_KEY) {
            AppConfig.grpc.auth.jwtKey = process.env.GRPC_JWT_KEY;
        }
        if (process.env.GRPC_SSL_ENABLED) {
            AppConfig.ssl.enabled = process.env.GRPC_SSL_ENABLED === 'true';
        }
        AppConfig.ipAddress = await loadIpAddress();
        AppConfig.discovery.hostname = loadHostname();
        appConfig = AppConfig;

        logger.debug(`App config loaded ${appConfig}`);

        appConfigPromise = null;
        success(appConfig);
    });

    return appConfigPromise;
}

function loadHostname() {
    const hostname = os.hostname();
    logger.info(`Resolved hostname ${hostname}`);
    return hostname;
}

async function loadIpAddress() {
    logger.info(`Resolving ip address...`);
    try {
        const ip = await localIpV4Address();
        logger.info(`IP resolved ${ip}`);
        return ip;
    } catch (e) {
        // logger.error(`Error resolving ip, falling back to default ${ip}`, e);
        return '127.0.0.1';
    }
}

module.exports = {
    getConfig
};
