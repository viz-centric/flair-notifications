const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
const logger = require('./../logger');
var models = require('../database/models/index');

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
          logger.log({
              level: 'error',
              message: "error occured while converting image to base64 uri",
              errMsg: "error occured while converting image to base64 uri : "+error.message,
          });
          let shedularlog = models.SchedulerTaskLog.create({
              SchedulerJobId: reports_data['report_shedular_obj']['id'],
              task_executed: new Date(Date.now()).toISOString(),
              task_status: "error occured while converting image to base64 uri : "+error.message,
          });
          reject(error.message);
        });
      }, function (error) {
        logger.log({
            level: 'error',
            message: "error occured while converting svg html to image",
            errMsg: "error occured while converting svg html to image : "+error.message,
        });
        let shedularlog = models.SchedulerTaskLog.create({
            SchedulerJobId: reports_data['report_shedular_obj']['id'],
            task_executed: new Date(Date.now()).toISOString(),
            task_status: "error occured while converting svg html to image : "+error.message,
        });
        reject(error.message);
      });
    } catch (ex) {
      logger.log({
          level: 'error',
          message: "error occured while processing an image",
          errMsg: "error occured while processing an image : "+ex.message,
      });
      let shedularlog = models.SchedulerTaskLog.create({
          SchedulerJobId: reports_data['report_shedular_obj']['id'],
          task_executed: new Date(Date.now()).toISOString(),
          task_status: "error occured while processing an image"+ex.message,
      });
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
