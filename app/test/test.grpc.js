// process.env.NODE_ENV = 'test';

// chai=require('chai');
// var expect  = chai.expect;
// var grpcClient = require('../grpc/client');



// describe('grpc connection', () => {
//     it('check grpc connection', (done) => {
//         let query = {
//             queryId: "1",
//             userId: "manohar",
//             sourceId: "1715917d-fff8-44a1-af02-ee2cd41a3609",
//             source: "Transactions",
//             fields: ["state", "price"],
//             groupBy: [],
//             limit: 5
//         }
//         grpc_call=grpcClient.getRecords(query);
//         grpc_call.then(function (response) {
//             console.log(response)
//             expect(response).to.be.a('object');
//             expect(response).to.have.property('queryId');
//             expect(response).to.have.property('userId');
//             expect(response).to.have.property('data');
//             done();
//         },
//         function(err){})    
        
//     });

// });

