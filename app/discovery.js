const AppConfig = require('./load_config');
const Eureka = require('eureka-js-client').Eureka;

const grpcPort = AppConfig.grpcPort;
const eurekaUrl = AppConfig.discovery.eureka.url;
const discoveryIp = AppConfig.discovery.ip;
const discoveryHostname = AppConfig.discovery.hostname;
const eurekaInstanceId = new Date().getTime();

const client = new Eureka({
    instance: {
        app: 'flair-notifications',
        instanceId: `flair-notifications-instance-${eurekaInstanceId}`,
        hostName: discoveryHostname,
        ipAddr: discoveryIp,
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

module.exports = client;
