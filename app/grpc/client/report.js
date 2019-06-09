const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");

const PROTO_PATH = 'app/grpc/Report.proto';

const queryProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);


module.exports = createClient();

function createClient(){
    return new queryProto.messages.ReportService("localhost:8090",
        grpc.credentials.createInsecure());
}


