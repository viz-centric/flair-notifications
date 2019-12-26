const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
var compress_images = require('compress-images');

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

async function generateImage(svgHtml, image_dir, imageName, channel) {
  return new Promise((resolve, reject) => {
    try {
      wkhtmltoimage.generate(svgHtml, { output: image_dir + imageName }, function (code, signal) {
        base64Img.base64(image_dir + imageName, function (err, base64Bytes) {
          var encodedUrl = "data:image/png;base64," + base64Bytes;

          if (fs.existsSync(image_dir + imageName)) {

            if (channel == "Teams") {
              (async () => {
                compress_images(image_dir + imageName, './compress-images/', { compress_force: false, statistic: true, autoupdate: true }, false,
                  { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
                  { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
                  { svg: { engine: 'svgo', command: '--multipass' } },
                  { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, function (error, completed, statistic) {

                    if (completed === true) {
                      base64Img.base64('./compress-images/' + imageName, function (err, base64Bytes) {
                        encodedUrl = base64Bytes;
                        if (fs.existsSync('./compress-images/' + imageName)) {
                          fs.unlinkSync('./compress-images/' + imageName);
                          resolve(encodedUrl);
                        }
                      });
                    }
                  });

              })();
            }
            else {
              // fs.unlinkSync(image_dir + imageName);
              resolve(encodedUrl);
            }
          }

        }, function (error) {
          logger.log({
            level: 'error',
            message: "error occured while converting image to base64 uri",
            errMsg: "error occured while converting image to base64 uri : " + error.message,
          });
          let shedularlog = models.SchedulerTaskLog.create({
            SchedulerJobId: reports_data['report_shedular_obj']['id'],
            task_executed: new Date(Date.now()).toISOString(),
            task_status: "error occured while converting image to base64 uri : " + error.message,
          });
          reject(error.message);
        });
      }, function (error) {
        logger.log({
          level: 'error',
          message: "error occured while converting svg html to image",
          errMsg: "error occured while converting svg html to image : " + error.message,
        });
        let shedularlog = models.SchedulerTaskLog.create({
          SchedulerJobId: reports_data['report_shedular_obj']['id'],
          task_executed: new Date(Date.now()).toISOString(),
          task_status: "error occured while converting svg html to image : " + error.message,
        });
        reject(error.message);
      });
    } catch (ex) {
      logger.log({
        level: 'error',
        message: "error occured while processing an image",
        errMsg: "error occured while processing an image : " + ex.message,
      });
      let shedularlog = models.SchedulerTaskLog.create({
        SchedulerJobId: reports_data['report_shedular_obj']['id'],
        task_executed: new Date(Date.now()).toISOString(),
        task_status: "error occured while processing an image" + ex.message,
      });
      reject(ex.message);
    }
  });
}

const imageProcessor = {
  saveImageConvertToBase64: async function (imageName, svgHtml, channel) {
    const config = await AppConfig.getConfig();
    const image_dir = config.imageFolder;
    return await generateImage(svgHtml, image_dir, imageName, channel);
  }
};

module.exports = imageProcessor;
