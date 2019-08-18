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
            AppConfig.eurekaUrl = process.env.EUREKA_URL;
        }
        if (process.env.GRPC_SSL_ENABLED) {
            AppConfig.ssl.enabled = process.env.GRPC_SSL_ENABLED;
        }
        if (process.env.DISCOVERY_HOSTNAME) {
            AppConfig.discovery.hostname = process.env.DISCOVERY_HOSTNAME;
        } else if (hostname) {
            AppConfig.discovery.hostname = hostname;
        }
        if (process.env.DISCOVERY_IP) {
            AppConfig.discovery.ip = process.env.DISCOVERY_IP;
        }
        return AppConfig;

    } catch (e) {
        console.log(e);
    }
}

AppConfig = load_appConfig(configFile);


module.exports = AppConfig;
