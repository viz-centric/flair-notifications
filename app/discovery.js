const AppConfig = require('./load_config');
const Eureka = require('eureka-js-client').Eureka;

const grpcPort = AppConfig.grpcPort;
const eurekaUrl = AppConfig.eurekaUrl;

const client = new Eureka({
    instance: {
        app: 'flair-notifications',
        hostName: 'localhost',
        ipAddr: '127.0.0.1',
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