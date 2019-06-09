const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const AppConfig = require('../load_config');
const grpcEndpoint = AppConfig.grpcEndPoint;

const PROTO_PATH = './app/grpc/Query.proto';

const queryproto = grpc.loadPackageDefinition(
   protoLoader.loadSync(PROTO_PATH, {
      keepCase: true,
      longs: String,
      enums: String,
      defaults: true,
      oneofs: true
   })
);

const client = new queryproto.messages.QueryService(grpcEndpoint, grpc.credentials.createInsecure());

const grpcClient = {
   getRecords: function (query) {
      return new Promise((resolve, reject) => {

         client.GetData(query, (error, response) => {
            if (!error) {
               resolve(response);

            }
            else {
               reject(error.message)
            }
         });


      })
   }
};
module.exports = grpcClient;
