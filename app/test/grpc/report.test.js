process.env.NODE_ENV = 'test';

const chai=require('chai');
const expect = chai.expect;
const client = require('./../../grpc/client/report');
const payload = require('./schleduleReportReq');

describe('grpc ReportProto', ()=> {
    it('schedule report processed successfully', (done)=>{
        client.scheduleReport(payload, (error, data) => {
            expect(data.message).to.be.eq('Report is scheduled successfully');
            expect(error).to.be.null;
            done();
        });
    });

    it('schedule report throws validation failure', (done)=>{
        done();
    });
});

