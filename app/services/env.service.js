const logger = require('../logger');
const localIpV4Address = require("local-ipv4-address");
const AppConfig = require('../load_config');

let ipAddress = '127.0.0.1';

logger.info('Resolving ip...');

function init() {
    return new Promise((success) => {
        localIpV4Address()
          .then(function (ip) {
              logger.info(`IP resolved ${ip}`);
              AppConfig.ipAddress = ip;
              success(ipAddress);
          })
          .catch(function (error) {
              logger.info('Error resolving ip', error);
              AppConfig.ipAddress = ipAddress;
              success(ipAddress);
          });
    });
}

module.exports = {
    init: init
};
