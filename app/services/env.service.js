const logger = require('../logger');
const localIpV4Address = require("local-ipv4-address");
const AppConfig = require('../load_config');

logger.info('Resolving ip...');

let ipDefault = 'localhost';

function init() {
    return new Promise((success) => {
      logger.info(`Node env ${process.env.NODE_ENV}`);
      if (process.env.NODE_ENV === 'development') {
            AppConfig.ipAddress = ipDefault;
            success(AppConfig.ipAddress);
        } else {
            localIpV4Address()
              .then(function (ip) {
                logger.info(`IP resolved ${ip}`);
                AppConfig.ipAddress = ip;
                success(AppConfig.ipAddress);
              })
              .catch(function (error) {
                logger.info('Error resolving ip', error);
                AppConfig.ipAddress = ipDefault;
                success(AppConfig.ipAddress);
            });
        }
    });
}

module.exports = {
    init: init
};
