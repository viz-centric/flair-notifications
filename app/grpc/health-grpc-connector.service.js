const grpc = require("grpc");
const logger = require("../logger");
const protoLoader = require("@grpc/proto-loader");
const HEALTH_PROTO_PATH = 'app/grpc/Health.proto';
const healthService = require('./../health/health.service');

const grpcOptions = {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
};

const packageDefinition = protoLoader.loadSync(HEALTH_PROTO_PATH, grpcOptions);
const healthProto = grpc.loadPackageDefinition(packageDefinition);

module.exports = { construct };

function handleCall(promise, callback) {
    return promise
      .then(data => callback(null, data))
      .catch(err => callback(null, err));
}

function bindEndpoints(server) {
    server.addService(healthProto.grpc.health.v1.Health.service, {
        check,
        watch
    });
}

function construct(server) {
    bindEndpoints(server);
}

function check(call, callback) {
    handleCall(healthService.check(call.request), callback);
}

function watch(call, callback) {
    handleCall(healthService.watch(call.request), callback);
}
