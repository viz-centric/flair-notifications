const yaml = require('js-yaml');
const fs = require('fs');
var default_config='./app/default_config.yml';
const configFile = process.env.APP_CONFIG || default_config;

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
        return AppConfig;

    } catch (e) {
        console.log(e);
    }
}

AppConfig=load_appConfig(configFile)


module.exports = AppConfig;
