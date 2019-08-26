process.env.NODE_ENV = 'test';

const chai=require('chai');
const expect  = chai.expect;

describe('loading config', () => {
    it('load confige file', (done) => {
    const AppConfig = require('../load_config');
    expect(AppConfig).to.be.a('object');
    expect(AppConfig).to.have.property('mailService');
    expect(AppConfig).to.have.property('grpcEndPoint');
    expect(AppConfig).to.have.property('imageFolder');
    done();
    });

});

