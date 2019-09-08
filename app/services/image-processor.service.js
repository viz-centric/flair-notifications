const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
const logger = require('./../logger');

function createImageDir(config) {
  const imageDir = config.imageFolder;
  logger.info(`Creating images dir ${imageDir}`);

  // create image dir if not exit
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }
}

async function init() {
  let config = await AppConfig.getConfig();
  createImageDir(config);
}

init();

function generateImage(svgHtml, image_dir, imageName) {
  return new Promise((resolve, reject) => {
    try {
      wkhtmltoimage.generate(svgHtml, {output: image_dir + imageName}, function (code, signal) {
        base64Img.base64(image_dir + imageName, function (err, base64Bytes) {
          var encodedUrl = "data:image/png;base64," + base64Bytes;
          if (fs.existsSync(image_dir + imageName)) {
            fs.unlinkSync(image_dir + imageName);
          }
          resolve(encodedUrl);
        }, function (error) {
          reject(error.message);
        });
      }, function (error) {
        reject(error.message);
      });
    } catch (ex) {
      reject(ex.message);
    }
  });
}

const imageProcessor = {
  saveImageConvertToBase64: async function (imageName, svgHtml) {
    const config = await AppConfig.getConfig();
    const image_dir = config.imageFolder;
    return await generateImage(svgHtml, image_dir, imageName);
  }
};

module.exports = imageProcessor;
