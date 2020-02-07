const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
var compress_images = require('compress-images');

const logger = require('./../logger');
var models = require('../database/models/index');
let config;
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
  createImageDir(config);
}

init();

async function generateImageTeam(svgHtml, imageName) {

  var encodedUrl = "";

  //TO DO: undo after testing 
  logger.log({
    level: 'info',
    message: "generateImageTeam " + svgHtml + " file name " + imageName
  });

  //TO DO: undo after testing 
  logger.log({
    level: 'info',
    message: "config object" + config + " config data  " + JSON.stringify(config)
  });

  return new Promise((resolve, reject) => {
    try {
      wkhtmltoimage.generate(svgHtml, { output: config.imageFolder + imageName }, async function (code, signal) {

        //TO DO: undo after testing 
        logger.log({
          level: 'info',
          message: "images created for team  " + config.imageFolder + imageName
        });

        await base64Img.base64(config.imageFolder + imageName, function (err, base64Bytes) {
          encodedUrl = "data:image/png;base64," + base64Bytes;

          //TO DO: undo after testing 
          logger.log({
            level: 'info',
            message: "base64 created for team images  " //+ encodedUrl
          });

          if (fs.existsSync(config.imageFolder + imageName)) {

            //TO DO: undo after testing 
            logger.log({
              level: 'info',
              message: "start images compress_images : " + config.imageFolder + imageName + " path : " + config.compressImageFolder
            });

            (async () => {
              await compress_images(config.imageFolder + imageName, config.compressImageFolder + "/", { compress_force: false, statistic: true, autoupdate: true }, false,
                { jpg: { engine: 'mozjpeg', command: ['-quality', '60'] } },
                { png: { engine: 'pngquant', command: ['--quality=20-50'] } },
                { svg: { engine: 'svgo', command: '--multipass' } },
                { gif: { engine: 'gifsicle', command: ['--colors', '64', '--use-col=web'] } }, function (error, completed, statistic) {

                  if (completed === true) {

                    //TO DO: undo after testing 
                    logger.log({
                      level: 'info',
                      message: "images compress_images is done  "
                    });

                    //TO DO: undo after testing 
                    logger.log({
                      level: 'info',
                      message: "start convert compress image to base64 : " + config.compressImageFolder + "/" + imageName
                    });


                    //TO DO: undo after testing 
                    logger.log({
                      level: 'info',
                      message: "statistic : " + JSON.stringify(statistic)
                    });

                    base64Img.base64(config.compressImageFolder + "/" + imageName, function (err, base64Bytes) {
                      encodedUrl = base64Bytes;

                      //TO DO: undo after testing 
                      logger.log({
                        level: 'info',
                        message: "done convert compress image to base64 : " + encodedUrl
                      });


                      //TO DO: undo after testing 
                      logger.log({
                        level: 'info',
                        message: "checking compress file  : " + config.compressImageFolder + imageName
                      });

                      if (fs.existsSync(config.compressImageFolder + "/" + imageName)) {
                        // fs.unlinkSync(config.compressImageFolder+"/" + imageName);
                        //fs.unlinkSync(config.imageFolder + imageName);

                        //TO DO: undo after testing 
                        logger.log({
                          level: 'info',
                          message: "retuen base64 for team : "
                        });

                        resolve(encodedUrl);
                      }
                      else {
                        //TO DO: undo after testing 
                        logger.log({
                          level: 'info',
                          message: "exist file or not ?" + fs.existsSync(config.compressImageFolder + "/" + imageName) + ":  config.compressImageFolder + " / " + imageName"
                        });
                        resolve(encodedUrl);
                      }
                    });

                  }
                  if (error) {

                    //TO DO: undo after testing 
                    logger.log({
                      level: 'info',
                      message: "error while compress image" + error
                    });
                    resolve(encodedUrl);

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
                  resolve(encodedUrl);
                });

            })();
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

async function generateImageEmail(svgHtml, imageName) {
  return new Promise((resolve, reject) => {
    try {

      var encodedUrl = "";
      //TO DO: undo after testing 
      logger.log({
        level: 'info',
        message: "generateImageEmail " + svgHtml + " file name " + imageName
      });

      //TO DO: undo after testing 
      logger.log({
        level: 'info',
        message: "config object" + config + " config data  " + JSON.stringify(config)
      });

      wkhtmltoimage.generate(svgHtml, { output: config.imageFolder + imageName }, async function (code, signal) {

        //TO DO: undo after testing 
        logger.log({
          level: 'info',
          message: "images created for email  " + config.imageFolder + imageName
        });

        await base64Img.base64(config.imageFolder + imageName, function (err, base64Bytes) {
          encodedUrl = "data:image/png;base64," + base64Bytes;

          //TO DO: undo after testing 
          logger.log({
            level: 'info',
            message: "base64 created for email images  " //+ encodedUrl
          });

          if (fs.existsSync(config.imageFolder + imageName)) {
            // fs.unlinkSync(config.imageFolder + imageName);
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

    //TO DO: undo after testing 
    logger.log({
      level: 'info',
      message: 'start generate image for email'
    });

    var base64 = await generateImageEmail(svgHtml, imageName);

    //TO DO: undo after testing 
    logger.log({
      level: 'info',
      message: 'generateImageEmail response ' + base64
    });

    return base64;
  },

  saveImageConvertToBase64Team: async function (imageName, svgHtml) {

    //TO DO: undo after testing 
    logger.log({
      level: 'info',
      message: 'start generate image for team'
    });

    var base64 = await generateImageTeam(svgHtml, imageName);

    //TO DO: undo after testing 
    logger.log({
      level: 'info',
      message: 'generateImageTeam response ' + base64
    });

    return base64;
  }
};

module.exports = imageProcessor;