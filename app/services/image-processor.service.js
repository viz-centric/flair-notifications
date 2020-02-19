const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
var compress_images = require('compress-images');
var path = require('path');
var Jimp = require('jimp');
const notificationAppConfig = require('../jobs/load-notification-config');

const logger = require('./../logger');
var models = require('../database/models/index');
let config, notificationConfig;

function createImageDir(config) {
  const imageDir = config.imageFolder;
  logger.info(`Creating images dir ${imageDir}`);

  // create image dir if not exit
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  if (!fs.existsSync(config.compressImageFolder)) {
    fs.mkdirSync(config.compressImageFolder);
  }
}

async function init() {
  config = await AppConfig.getConfig();
  notificationConfig = await notificationAppConfig.getConfig();
  createImageDir(config);
}

init();

async function generateImageTeam(svgHtml, imageName) {

  var encodedUrl = "";

  return new Promise((resolve, reject) => {
    try {
      wkhtmltoimage.generate(svgHtml, { output: config.imageFolder + imageName }, async function (code, signal) {

        if (fs.existsSync(config.imageFolder + imageName)) {
          logger.log({
            level: 'info',
            message: "start images compress_images : " + config.imageFolder + imageName + " path : " + config.compressImageFolder
          });

          try {
            (async () => {
              await compress_images(config.imageFolder + imageName, config.compressImageFolder, { compress_force: false, statistic: true, autoupdate: true }, false,
                { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
                { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
                { svg: { engine: 'svgo', command: '--multipass' } },
                { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, async function (error, completed, statistic) {

                  if (completed === true) {

                    logger.log({
                      level: 'info',
                      message: "statistic : " + JSON.stringify(statistic)
                    });

                    if (statistic) {
                      logger.log({
                        level: 'info',
                        message: "start convert compress image to base64 : " + statistic.path_out_new
                      });

                      if (statistic.size_output > 10000) {
                        try {
                          await Jimp.read(statistic.path_out_new)
                            .then(image => {
                              var resizeFile = path.basename(statistic.path_out_new, '.png') + ".jpg";

                              image
                                .resize(notificationConfig.resizeImageWidth, notificationConfig.resizeImageHeight) // resize
                                .quality(60)
                                .write(resizeFile); // save

                              base64Img.base64(resizeFile, function (err, base64Bytes) {
                                encodedUrl = base64Bytes;

                                var base64DisplayString = encodedUrl != undefined ? encodedUrl.substring(0, 15) + "..." : encodedUrl

                                logger.log({
                                  level: 'info',
                                  message: "done convert compress image to base64 : " + base64DisplayString
                                });

                                if (fs.existsSync(statistic.path_out_new)) {

                                  logger.log({
                                    level: 'info',
                                    message: "deleting compress image  : " + statistic.path_out_new
                                  });
                                  fs.unlinkSync(statistic.path_out_new);
                                }
                                if (fs.existsSync(config.imageFolder + imageName)) {

                                  logger.log({
                                    level: 'info',
                                    message: "deleting team image  : " + config.imageFolder + imageName
                                  });
                                  fs.unlinkSync(config.imageFolder + imageName);
                                }
                                if (fs.existsSync(resizeFile)) {

                                  logger.log({
                                    level: 'info',
                                    message: "deleting team resize image  : " + resizeFile
                                  });
                                  fs.unlinkSync(resizeFile);
                                }
                                resolve(encodedUrl+"|"+notificationConfig.compressImagesText);

                              });
                            })
                            .catch(err => {
                              console.error(err);
                            });
                        } catch (error) {
                          logger.log({
                            level: 'error',
                            message: "error occured while compress image",
                            errMsg: "error occured while compress image : " + error
                          });
                        }

                      }
                      else {
                        base64Img.base64(statistic.path_out_new, function (err, base64Bytes) {
                          encodedUrl = base64Bytes;

                          var base64DisplayString = encodedUrl != undefined ? encodedUrl.substring(0, 15) + "..." : encodedUrl

                          logger.log({
                            level: 'info',
                            message: "done convert compress image to base64 : " + base64DisplayString
                          });

                          if (fs.existsSync(statistic.path_out_new)) {

                            logger.log({
                              level: 'info',
                              message: "deleting compress image  : " + statistic.path_out_new
                            });
                            fs.unlinkSync(statistic.path_out_new);
                          }
                          if (fs.existsSync(config.imageFolder + imageName)) {

                            logger.log({
                              level: 'info',
                              message: "deleting team image  : " + config.imageFolder + imageName
                            });
                            fs.unlinkSync(config.imageFolder + imageName);
                          }
                          resolve(encodedUrl+"|"+"");

                        });
                      }
                    }
                    else {
                      logger.log({
                        level: 'error',
                        message: "error while compress image" + error
                      });
                      resolve(encodedUrl+"|"+"");
                    }
                  }
                  else {
                    resolve(encodedUrl+"|"+"");
                  }
                  if (error) {
                    logger.log({
                      level: 'info',
                      message: "error while compress image" + error
                    });
                    resolve(encodedUrl+"|"+"");
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
                  resolve(encodedUrl+"|"+"");
                });

            })();
          } catch (error) {
            logger.log({
              level: 'error',
              message: "error occured while compress image",
              errMsg: "error occured while compress image : " + error
            });
          }

        }

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
        resolve(encodedUrl+"|"+"");
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
      resolve(encodedUrl+"|"+"");
    }
  });
}

async function generateImageEmail(svgHtml, imageName) {
  return new Promise((resolve, reject) => {
    try {
      var encodedUrl = "";
      wkhtmltoimage.generate(svgHtml, { output: config.imageFolder + imageName }, async function (code, signal) {

        logger.log({
          level: 'info',
          message: "images created for email  " + config.imageFolder + imageName
        });

        await base64Img.base64(config.imageFolder + imageName, function (err, base64Bytes) {
          encodedUrl = "data:image/png;base64," + base64Bytes;

          var base64DisplayString = encodedUrl != undefined ? encodedUrl.substring(0, 5) + "..." : encodedUrl

          logger.log({
            level: 'info',
            message: "base64 created for email images  " + base64DisplayString
          });

          if (fs.existsSync(config.imageFolder + imageName)) {
            logger.log({
              level: 'info',
              message: "deleting email image  : " + config.imageFolder + imageName
            });
            fs.unlinkSync(config.imageFolder + imageName);
          }
          resolve(encodedUrl);
        }, function (error) {
          logger.log({
            level: 'error',
            message: "error occured while converting image to base64 uri",
            errMsg: "error occured while converting image to base64 uri : " + error.message,
          });
          let shedularlog = models.SchedulerTaskLog.create({
            SchedulerJobId: reports_data['report_shedular_obj']['id'],
            task_status: "error occured while converting image to base64 uri : " + error.message,
          });
          resolve(encodedUrl);
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
        resolve(encodedUrl);
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
      resolve(encodedUrl);
    }
  });
}

const imageProcessor = {
  saveImageConvertToBase64ForEmail: async function (imageName, svgHtml) {
    return await generateImageEmail(svgHtml, imageName);
  },

  saveImageConvertToBase64ForTeam: async function (imageName, svgHtml) {
    return await generateImageTeam(svgHtml, imageName);
  }
};

module.exports = imageProcessor;