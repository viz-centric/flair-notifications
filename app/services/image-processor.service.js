var wkhtmltoimage = require('wkhtmltoimage');
var fs = require('fs');
var AppConfig = require('../load_config');
var base64Img = require('base64-img');

wkhtmltoimage = wkhtmltoimage.setCommand('/usr/bin/wkhtmltoimage');

var imageProcessor= {
   saveImageConvertToBase64:  function(imageName,svgHtml) {
      const image_dir = AppConfig.getConfig().imageFolder;
      return new Promise((resolve, reject) => {
         try{
            wkhtmltoimage.generate(svgHtml, { output: image_dir + imageName }, function (code, signal) {
               base64Img.base64(image_dir + imageName, function(err, base64Bytes) {
                  var encodedUrl = "data:image/png;base64,"+ base64Bytes;
                  fs.unlink(image_dir + imageName);
                  resolve(encodedUrl);
               },function(error){
                  reject(error.message);
               });
            },function(error){
               reject(error.message);
            });
         }catch (ex) {
            reject(ex.message);
         }
      });
  }
}
module.exports = imageProcessor;
