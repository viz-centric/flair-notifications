process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const imageProcessorService = require('../services/image-processor.service');


describe('Image Processor Service', () => {
  it('service return base64 bytes ', async () => {
    var imagefilename = 'test.png';
    let result = await imageProcessorService.saveImageConvertToBase64(imagefilename, 'http://example.com/')
    expect(result).to.be.eq('data:image/png;base64,undefined');
  });

});

