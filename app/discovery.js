const AppConfig = require('./load_config');
const Eureka = require('eureka-js-client').Eureka;

const grpcPort = AppConfig.grpcPort;

const client = new Eureka({
    instance: {
        app: 'flair-notifications',
        hostName: 'localhost',
        instanceId: 'flair-notifications',
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
                'http://admin:admin@localhost:8761/eureka/apps'
            ]
        },
    },
});

module.exports = client;