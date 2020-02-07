const wkhtmltoimage = require('wkhtmltoimage').setCommand('/usr/bin/wkhtmltoimage');
const fs = require('fs');
const AppConfig = require('../load_config');
const base64Img = require('base64-img');
var compress_images = require('compress-images');

const logger = require('./../logger');
var models = require('../database/models/index');
let config, compressImageFolder, imageDir;
function createImageDir(config) {
  imageDir = config.imageFolder + "/";
  compressImageFolder = config.compressImageFolder + "/";

  logger.info(`Creating images dir ${imageDir}`);

  // create image dir if not exit
  if (!fs.existsSync(imageDir)) {
    fs.mkdirSync(imageDir);
  }

  if (!fs.existsSync(compressImageFolder)) {
    fs.mkdirSync(compressImageFolder);
  }
}

async function init() {
  config = await AppConfig.getConfig();
  createImageDir(config);
}

init();

async function generateImageTeam(svgHtml, imageName) {

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
      wkhtmltoimage.generate(svgHtml, { output: imageDir + imageName }, async function (code, signal) {

        //TO DO: undo after testing 
        logger.log({
          level: 'info',
          message: "images created for team  " + imageDir + imageName
        });

        await base64Img.base64(imageDir + imageName, function (err, base64Bytes) {
          var encodedUrl = "data:image/png;base64," + base64Bytes;

          //TO DO: undo after testing 
          logger.log({
            level: 'info',
            message: "base64 created for team images  " + encodedUrl
          });

          if (fs.existsSync(imageDir + imageName)) {

            //TO DO: undo after testing 
            logger.log({
              level: 'info',
              message: "start images compress_images : " + imageDir + imageName + " path : " + compressImageFolder
            });

            (async () => {
              await compress_images(imageDir + imageName, compressImageFolder , { compress_force: false, statistic: true, autoupdate: true }, false,
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
                      message: "start convert compress image to base64 : " + compressImageFolder +  imageName
                    });


                    //TO DO: undo after testing 
                    logger.log({
                      level: 'info',
                      message: "statistic : " + JSON.stringify(statistic)
                    });

                    base64Img.base64(compressImageFolder +  imageName, function (err, base64Bytes) {
                      encodedUrl = base64Bytes;

                      //TO DO: undo after testing 
                      logger.log({
                        level: 'info',
                        message: "done convert compress image to base64 : " + encodedUrl
                      });


                      //TO DO: undo after testing 
                      logger.log({
                        level: 'info',
                        message: "checking compress file  : " + compressImageFolder +  imageName
                      });

                      if (fs.existsSync(compressImageFolder +  imageName)) {
                        fs.unlinkSync(compressImageFolder +  imageName);
                        //fs.unlinkSync(imageDir + imageName);

                        //TO DO: undo after testing 
                        logger.log({
                          level: 'info',
                          message: "retuen base64 for team : "
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

async function generateImageEmail(svgHtml, imageName) {
  return new Promise((resolve, reject) => {
    try {

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

      wkhtmltoimage.generate(svgHtml, { output: imageDir + imageName }, async function (code, signal) {

        //TO DO: undo after testing 
        logger.log({
          level: 'info',
          message: "images created for email  " + imageDir + imageName
        });

        await base64Img.base64(imageDir + imageName, function (err, base64Bytes) {
          var encodedUrl = "data:image/png;base64," + base64Bytes;

          //TO DO: undo after testing 
          logger.log({
            level: 'info',
            message: "base64 created for email images  " //+ encodedUrl
          });

          if (fs.existsSync(imageDir + imageName)) {
            fs.unlinkSync(imageDir + imageName);
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