const grpc = require('grpc');
const report = require('./grpc/report');

module.exports = {
    start: startServer
};

/**
 * Start the GRPC server on the selected port.
 * @param port
 */
function startServer(port) {
    const server = new grpc.Server();
    registerEndpoints(server);
    server.bind('127.0.0.1:' + port, grpc.ServerCredentials.createInsecure());
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
