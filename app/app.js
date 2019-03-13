
var express = require('express')
var bodyParser = require('body-parser');
var jobs = require('./jobs')
const fs = require('fs');
var validator = require('./validator');

var AppConfig = require('./load_config');

var images_dir = AppConfig.imageFolder;

// create image dir if not exit 
if (!fs.existsSync(images_dir)) {
    fs.mkdirSync(images_dir);
}

var app = express()

app.use(bodyParser.json()); // support json encoded bodies
app.use(bodyParser.urlencoded({ extended: true })); // support encoded bodies




app.post('/api/jobSchedule/', function (req, res) {
    var result = validator.validateReportReqBody(req.body);
    if (result.error) {
        res.status(422).json({
            status: 'error',
            message: 'Invalid request data',
            data: result.error.details
        });
    }
    else {
        reslt = jobs.createJob(req.body);
        reslt.then(function (result) {
            res.send(result);
        }, function (err) {
            res.send(err);
        })
    }

});
app.put('/api/jobModify/', function (req, res) {
    var result = validator.validateReportReqBody(req.body);
    if (result.error) {
        res.status(422).json({
            status: 'error',
            message: 'Invalid request data',
            data: result.error.details
        });
    }
    else {
        reslt = jobs.modifyJob(req.body);
        reslt.then(function (result) {
            res.send(result);
        }, function (err) {
            res.send(err);
        })
    }

});
app.delete('/api/jobCancel/', function (req, res) {
    reslt = jobs.deleteJob(req.body);
        reslt.then(function (result) {
            res.send(result);
        }, function (err) {
            res.send(err);
        })

});
app.get('/api/jobLogs/', function (req, res) {
    reslt = jobs.jobLogs(req.body);
        reslt.then(function (result) {
            res.send(result);
        }, function (err) {
            res.send(err);
        })

});

module.exports = app;  // for testing





