const AppConfig = require('./load_config');
const grpc = require('grpc');
const report = require('./grpc/report');
const fs = require('fs');
const logger = require('./logger');

module.exports = {
    start: startServer
};

/**
 * Start the GRPC server on the selected port.
 * @param port
 * @param sslConfig
 */
async function startServer(port, sslConfig) {
    const config = await AppConfig.getConfig();
    const ipAddress = config.ipAddress;
    logger.info(`Starting grpc server on port ${ipAddress}:${port}`);
    const server = new grpc.Server();
    registerEndpoints(server);

    let credentials;
    if (sslConfig.enabled) {
        logger.info(`grpc server with ssl enabled ${sslConfig.caCert} ${sslConfig.serverCert} ${sslConfig.serverKey}`);
        let rootCerts = fs.readFileSync(sslConfig.caCert);
        let keyCert = {
            cert_chain: fs.readFileSync(sslConfig.serverCert),
            private_key: fs.readFileSync(sslConfig.serverKey)
        };
        credentials = grpc.ServerCredentials.createSsl(rootCerts, [keyCert], true);
    } else {
        logger.info(`grpc server with ssl disabled`);
        credentials = grpc.ServerCredentials.createInsecure()
    }

    server.bind(`${ipAddress}:${port}`, credentials);
    server.start()
}

/**
 * Register all GRPC services to the server.
 * @param server
 */
function registerEndpoints(server) {
    report.forEach(function (item) {
        item(server);
    });
}
