const express = require('express');
const bodyParser = require('body-parser');
const jobs = require('./jobs/schedulerJobs');
const channelJobs = require('./jobs/channelJobs');
const util = require('./util')
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

app.get('/api/executeImmediate/', (req, res) => {
    var visualizationid = req.query.visualizationid;
    jobs.executeImmediate(visualizationid).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

app.get('/api/deleteJob/', (req, res) => {
    var visualizationid = req.query.visualizationid;
    jobs.deleteJob(visualizationid).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

app.post('/api/jobSchedule/', function (req, res) {
    var result = validator.validateReportReqBody(req.body);
    if (result.error) {
        logger.log({
            level: 'error',
            message: 'error in schedule api due to invalid request body',
            errMsg: result.error.details[0].message
        });
        res.status(422).json({
            message: result.error.details[0].message.replace(/\"/g, ""),
        });
    }
    else {
        jobs.createJob(req.body).then(function (result) {
            res.status(result.success === 1 ? 201 : 302).json({ message: result.message })
        }, function (err) {
            res.send(err);
        })
    }

});


app.get('/api/user/:userName/reports', (req, res) => {
    var page = (+req.query.page);
    var pageSize = (+req.query.pageSize);
    jobs.JobsByUser(req.params.userName, page, pageSize).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});


app.get('/api/jobLogs/', (req, res) => {
    var page = (+req.query.page);
    var pageSize = (+req.query.pageSize);
    var visualizationid = req.query.visualizationid;
    jobs.jobLogs(visualizationid, page, pageSize).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

//Channel testing 
app.post('/api/addChannelConfigs/', function (req, res) {
    if (req.body) {
        channelJobs.addChannelConfigs(req.body).then(function (result) {
            res.status(result.success === 1 ? 201 : 302).json({ message: result.message })
        }, function (err) {
            res.send(err);
        })
    }
});

app.get('/api/getChannelByChannelName/', (req, res) => {
    var channel = req.query.channel;
    channelJobs.getChannelByChannelName(channel).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

app.post('/api/updateChannel/', function (req, res) {
    if (req.body) {
        channelJobs.updateChannel(req.body).then(function (result) {
            res.status(result.success === 1 ? 201 : 302).json(result)
        }, function (err) {
            res.send(err);
        })
    }
});

app.get('/api/getChannel/', (req, res) => {
    channelJobs.getChannel().then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

app.get('/api/getChannelProperties/', (req, res) => {
    channelJobs.getChannelProperties().then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});

app.get('/api/deleteChannelConfig/', (req, res) => {
    var id = req.query.id;
    channelJobs.deleteChannelConfig(id).then(function (result) {
        res.send(result);
    }, function (err) {
        res.send(err);
    })
});


module.exports = app;    //for testing





