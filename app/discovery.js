const AppConfig = require('./load_config');
const Eureka = require('eureka-js-client').Eureka;
const logger = require('./logger');
const grpcPort = AppConfig.grpcPort;
const eurekaUrl = AppConfig.discovery.eureka.url;
const discoveryHostname = AppConfig.discovery.hostname;
const eurekaInstanceId = new Date().getTime();

function start() {
  const ipAddress = AppConfig.ipAddress;
  logger.info(`Starting eureka ${ipAddress}`);
  const client = new Eureka({
    instance: {
      app: 'flair-notifications',
      instanceId: `flair-notifications-instance-${eurekaInstanceId}`,
      hostName: discoveryHostname,
      ipAddr: ipAddress,
      port: {
        "$": grpcPort,
        "@enabled": true
      },
      vipAddress: 'flair-notifications',
      dataCenterInfo: {
        '@class': 'com.netflix.appinfo.InstanceInfo$DefaultDataCenterInfo',
        name: 'MyOwn',
      },
      registerWithEureka: true,
      fetchRegistry: true
    },
    eureka: {
      serviceUrls: {
        default: [
          `${eurekaUrl}/apps`
        ]
      },
    },
  });

  client.start();
}

module.exports = {
  start: start
};
