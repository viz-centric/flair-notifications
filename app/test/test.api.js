process.env.NODE_ENV = 'test';

chai=require('chai');
var expect  = chai.expect();
var should =chai.should();
var app= require('./test.app');
var chaiHttp = require('chai-http');
chai.use(chaiHttp);

describe('/api/jobSchedule/', () => {
    it('shedual a jab', () => {

    });

});

