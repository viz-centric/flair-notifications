const express = require('express');
const bodyParser = require('body-parser');
const jobs = require('./jobs');
const validator = require('./validator');
const logger = require('./logger');

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





