const grpc = require('grpc');
const report = require('./grpc/report');
const fs = require('fs');

module.exports = {
    start: startServer
};

/**
 * Start the GRPC server on the selected port.
 * @param port
 * @param config
 */
function startServer(port, config) {
    const server = new grpc.Server();
    registerEndpoints(server);

    let credentials;
    if (config.enabled) {
        let rootCerts = fs.readFileSync(config.caCert);
        let keyCert = {
            cert_chain: fs.readFileSync(config.serverCert),
            private_key: fs.readFileSync(config.serverKey)
        };
        credentials = grpc.ServerCredentials.createSsl(rootCerts, [keyCert], true);
    } else {
        credentials = grpc.ServerCredentials.createInsecure()
    }

    server.bind(`127.0.0.1:${port}`, credentials);
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
