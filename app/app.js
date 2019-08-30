const express = require('express');
const bodyParser = require('body-parser');
const jobs = require('./jobs');
const fs = require('fs');
const AppConfig = require('./load_config');
const validator = require('./validator');
const logger = require('./logger');

function createImageDir() {
    const imageDir = AppConfig.getConfig().imageFolder;
    logger.info(`Creating images dir ${imageDir}`);

    // create image dir if not exit
    if (!fs.existsSync(imageDir)) {
        fs.mkdirSync(imageDir);
    }
}

async function init() {
    await AppConfig.loadConfig();
    createImageDir();
}

init();

const app = express();

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies

app.post('/api/buildVisualizationImage/', function (req, res) {
    var result = validator.validateBuildVisualizationReqBody(req.body);
    if (result.error) {
        logger.log({
            level: 'error',
            message: 'error building visualization image due to invalid request body',
            errMsg: result.error.details[0].message
        });
        res.statusMessage = result.error.details[0].message.replace(/\"/g, "");
        res.status(422).end();
    }
    else {
        jobs.buildVisualizationImage(req.body).then(function (img) {
            res.send(img);
        }).catch(function (error) {
            res.send({
                message: error.message
            });
        });
    }

});

module.exports = app;    //for testing





