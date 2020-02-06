process.env.NODE_ENV = 'test';
chai=require('chai');
var expect  = chai.expect;
var imageProcessorService = require('../services/image-processor.service');



describe('Image Processor Service', () => {
    it('service return base64 bytes ', (done) => {
        var imagefilename='test.png'
        var imageProcessorServiceResponse=imageProcessorService.saveImageConvertToBase64ForEmail(imagefilename,'http://example.com/')
        imageProcessorServiceResponse.then(function (response) {
            done();
        }).
        catch(function (done) {
        });
    });

});

