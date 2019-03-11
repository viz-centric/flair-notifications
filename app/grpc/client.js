
let grpc = require("grpc");
var protoLoader = require("@grpc/proto-loader");
var AppConfig = require('../load_config');
var grpc_endpoint= AppConfig.grpcEndPoint;

const PROTO_PATH = './app/grpc/Query.proto';

var queryproto = grpc.loadPackageDefinition(
   protoLoader.loadSync(PROTO_PATH, {
     keepCase: true,
     longs: String,
     enums: String,
     defaults: true,
     oneofs: true
   })
 );

const client = new queryproto.messages.QueryService(grpc_endpoint, grpc.credentials.createInsecure());

var grpc_client= {
   getRecords:  function(query) {
      return new Promise((resolve, reject) => {

         client.GetData(query, (error, response) => {
            if (!error ) {
               resolve(response);

            }
            else {
               reject(error.message)
            }
         });


      })
  }
}
module.exports = grpc_client;
