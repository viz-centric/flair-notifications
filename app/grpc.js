const grpc = require('grpc')

module.exports = {
    start: startServer
}

function startServer(port) {
    const server = new grpc.Server()
    server.bind('127.0.0.1:' + port, grpc.ServerCredentials.createInsecure());
    server.start()
}