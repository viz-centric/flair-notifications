process.env.NODE_ENV = 'test';
const chai = require('chai');
const expect = chai.expect;
const imageProcessorService = require('../services/image-processor.service');


describe('Image Processor Service', () => {
  // it('service return base64 bytes ', (done) => {
  //   var imagefilename = 'test.png';
  //   imageProcessorService.saveImageConvertToBase64(imagefilename, 'http://example.com/')
  //     .then((result) => {
  //       expect(result).to.be.eq('data:image/png;base64,undefined');
  //       done();
  //     });
  // });

});

