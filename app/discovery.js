const AppConfig = require('./load_config');
const Eureka = require('eureka-js-client').Eureka;
const logger = require('./logger');

let client;
const promises = [];

async function start() {
  logger.info('AppConfig ', AppConfig);
  const config = await AppConfig.getConfig();
  const grpcPort = config.grpcPort;
  const ipAddress = config.ipAddress;
  const eurekaUrl = config.discovery.eureka.url;
  const discoveryHostname = config.discovery.hostname;
  const eurekaInstanceId = new Date().getTime();

  if (process.env.EUREKA_URL) {
    eurekaUrl = process.env.EUREKA_URL;
  }
  
  logger.info(`Starting eureka ip ${ipAddress} hostname ${discoveryHostname} url ${eurekaUrl} grpc port ${grpcPort}`);
  client = new Eureka({
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
  client.on('registryUpdated', () => {
    logger.info(`Discovery registry updated`);
    check();
  });
  client.on('started', () => {
    logger.info(`Discovery started`);
    check();
  });
  client.start();
}

function getClient(appId) {
  logger.info(`Get client ${appId}`);
  return new Promise((success, reject) => {
    logger.info(`Get client adding promise`);
    promises.push({ success, reject, appId });
    check();
  });
}

function check() {
  if (!client) {
    logger.info(`Discovery client does not yet exist`);
    return;
  }
  const copyOfPromises = promises.slice();
  for (let o of copyOfPromises) {
    logger.info(`Checking client ${client}`, o);
    let instances = client.getInstancesByAppId(o.appId);
    logger.info(`Check ${o.appId} is ${instances}`);
    if (instances.length !== 0) {
      promises.splice(promises.indexOf(o), 1);
      o.success(instances);
    }
  }
}

async function getAppUrl(appId) {
  logger.info(`Get app url ${appId}`);
  const domain = await getAppDomain(appId);
  let url;
  if (process.env.GRPC_SSL_ENABLED === 'true') {
    url = 'https://' + domain;
  } else {
    url = 'http://' + domain;
  }
  logger.info(`Get app url ${url}`);
  return url;
}

async function getAppDomain(appId) {
  logger.info(`Get app domain ${appId}`);
  const instances = await getClient(appId);
  logger.info(`Get app instances`, instances);
  let url;
  if (process.env.GRPC_SSL_ENABLED === 'true') {
    url = instances[0].hostName + ':' + instances[0].securePort.$
  } else {
    url = instances[0].hostName + ':' + instances[0].port.$
  }
  logger.info(`Get app domain ${url}`);
  return url;
}

module.exports = {
  start,
  getAppUrl,
  getAppDomain,
};
