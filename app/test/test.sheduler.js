process.env.NODE_ENV = 'test';

chai=require('chai');
var AppConfig = require('../load_config');
var image_dir = AppConfig.imageFolder;
var wkhtmltoimage = require('wkhtmltoimage');
var scheduler = require('node-schedule');
var fs = require('fs');

describe('node schedule', () => {
    
    it('check node sheduler', (done) => {
        
        var date = new Date();
        var dateAfterTwoSecond = new Date(date.getTime() + 3000);
        var filetoCheck;
        scheduler.scheduleJob(dateAfterTwoSecond, function(){
            var imagefilename='test'+ '_' + new Date().getTime() +'.jpg';
            wkhtmltoimage.generate('http://example.com/', { output: image_dir + imagefilename });
            filetoCheck=image_dir+imagefilename;
        });
        
        setTimeout(() => checkImage(filetoCheck), 7000);
        function checkImage(path){
            
            if (fs.existsSync(path)) {
                done()
            }
            //delete after test
            fs.unlinkSync(path);
        }
        
        
    });

});

