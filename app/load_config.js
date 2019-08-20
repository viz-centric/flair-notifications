const yaml = require('js-yaml');
const fs = require('fs');
const logger = require('./logger');
const os = require("os");
const default_config='./app/default_config.yml';
const configFile = process.env.APP_CONFIG || default_config;

const hostname = os.hostname();
logger.info(`Discovery hostname ${hostname}`);

function load_appConfig(configFile){
    try {
        var AppConfig = yaml.safeLoad(fs.readFileSync(configFile, 'utf8'));

        if (process.env.mailServiceAuthUser ){
            AppConfig.mailService.auth.user=process.env.mailServiceAuthUser;
        }
        if ( process.env.mailServiceAuthPass ){
            AppConfig.mailService.auth.pass=process.env.mailServiceAuthPass;
        }
        if (process.env.EUREKA_URL) {
            AppConfig.discovery.eureka.url = process.env.EUREKA_URL;
        }
        if (process.env.GRPC_SSL_ENABLED) {
            AppConfig.ssl.enabled = process.env.GRPC_SSL_ENABLED === 'true';
        }
        AppConfig.discovery.hostname = hostname;
        return AppConfig;

    } catch (e) {
        console.log(e);
    }
}

let appConfig = load_appConfig(configFile);

logger.info(`App config loaded`);

module.exports = appConfig;
