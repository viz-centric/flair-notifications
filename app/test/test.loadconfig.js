process.env.NODE_ENV = 'test';

const chai = require('chai');
const expect = chai.expect;
const AppConfig = require('../load_config');

describe('loading config', () => {
  it('load confige file', async () => {
    const config = await AppConfig.getConfig();
    expect(config).to.be.a('object');
    expect(config).to.have.property('mailService');
    expect(config).to.have.property('imageFolder');
  });

});

