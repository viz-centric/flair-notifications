const grpc = require('grpc')
const PROTO_PATH = 'grpc/Query.proto'
const queryproto = grpc.load(PROTO_PATH)

var AppConfig = require('../load_config');
var grpc_endpoint= AppConfig.grpcEndPoint

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
