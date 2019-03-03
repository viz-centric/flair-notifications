process.env.NODE_ENV = 'test';

chai=require('chai');
var expect  = chai.expect;
var AppConfig = require('../load_config');
var image_dir = AppConfig.imageFolder;
var wkhtmltoimage = require('wkhtmltoimage');
var sendmailtool = require('../send-mail');
var fs = require('fs');

describe('send mail', () => {
    it('check send mail', (done) => {
        var to_mail_list = [AppConfig.mailService.testUser]
        var mail_body = "test body"
        var report_title = "title"
        var subject = "test"
        imagefilename='test.jpg';
        wkhtmltoimage.generate('http://example.com/', { output: image_dir + imagefilename });
        console.log(image_dir + imagefilename)
        var mailsend_call= sendmailtool.sendMail(subject,to_mail_list,mail_body,report_title,imagefilename);
        mailsend_call.then(function (response) {
            var status= response.split(" ")[2]
            expect(status).to.equal("OK");
            done();
            //delete after test
            fs.unlinkSync(image_dir+imagefilename);

        },
            function (error) {
                console.log(error)
            }); 
        
    });

});

