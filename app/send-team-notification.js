
const axios = require('axios');
var models = require('./database/models/index');
var logger = require('./logger');
const channelJob = require('./jobs/channelJobs');
const db = require('./database/models/index');
var moment = require('moment');
const util = require('./util');


let config = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": "0076D7",
    "text": "",
    "title": "",
    "summary": "",
    "sections": [{
        "facts": [{
            "name": "Deshboaed: ",
            "value": ""
        }, {
            "name": "View",
            "value": ""
        }],
        "activitySubtitle": "",
        "markdown": true
    }],
    "potentialAction": [
        {
            "@type": "OpenUri",
            "name": "Go to Widget",
            "targets": [
                { "os": "default", "uri": "" }
            ]
        },
        {
            "@type": "OpenUri",
            "name": "Go to Dashboard",
            "targets": [
                { "os": "default", "uri": "" }
            ]
        },
        {
            "@type": "OpenUri",
            "name": "View Data",
            "targets": [
                { "os": "default", "uri": "https://www.google.com/webhp?hl=en&sa=X&ved=0ahUKEwjdh9Lb_cvmAhXhheYKHVpDCZMQPAgH" }
            ]
        },
        {
            "@type": "OpenUri",
            "name": "Flair Insights",
            "targets": [
                { "os": "default", "uri": "https://www.google.com/webhp?hl=en&sa=X&ved=0ahUKEwjdh9Lb_cvmAhXhheYKHVpDCZMQPAgH" }
            ]
        }
    ]
}


exports.sendTeamNotification = async function sendNotification(teamConfig, reportData) {
    config.title = teamConfig.reportTitle;

    var tbody = "- |";

    var tablekey = Object.keys(teamConfig.tableData[0]);

    for (var j = 0; j < tablekey.length; j++) {
        tbody += tablekey[j] + " | ";
    }
    tbody += "\r";
    for (let index = 0; index < teamConfig.tableData.length; index++) {
        const element = teamConfig.tableData[index];
        tbody += "- | "
        for (var j = 0; j < tablekey.length; j++) {
            tbody += element[tablekey[j]] + " | ";
        }
        tbody += "\r"
    }

    config.sections[0].text = tbody;
    config.sections[0].summary = tbody;
    config.sections[0].facts[0].value = teamConfig.dashboard;
    config.sections[0].facts[1].value = teamConfig.view;
    config.sections[0].activitySubtitle = teamConfig.description;
    config.potentialAction[0].targets[0].uri = teamConfig.shareLink;
    config.potentialAction[1].targets[0].uri = teamConfig.buildUrl;
  
    webhookURL = await channelJob.getWebhookList(teamConfig.webhookURL); //[1]

    var notificationSent = false, error_message = "";

    const transaction = await db.sequelize.transaction();
    try {
        let shedularlog = await models.SchedulerTaskLog.create({
            SchedulerJobId: reportData['report_shedular_obj']['id'],
            task_executed: new Date(Date.now()).toISOString(),
            task_status: "success",
            thresholdMet: reportData.report_obj.thresholdAlert,
            notificationSent: notificationSent,
            channel: 'Teams'
        }, { transaction });

        var schedulerTaskMeta;

        schedulerTaskMeta = await models.SchedulerTaskMeta.create({
            SchedulerTaskLogId: shedularlog.id,
            rawQuery: teamConfig.rawQuery,
        }, { transaction });

        await transaction.commit();
        var thresholdTime = "Threshold run at " + moment(schedulerTaskMeta.createdAt).format(util.dateFormat());

        config.potentialAction[2].targets[0].uri = util.getViewDataURL(teamConfig.shareLink, schedulerTaskMeta.id);
        config.potentialAction[3].targets[0].uri =   flairInsightsLink = util.getGlairInsightsLink(teamConfig.shareLink, teamConfig.visualizationId)
        config.text = thresholdTime + ' ![chart image](' + teamConfig.base64 + ')';

        for (let index = 0; index < webhookURL.records.length; index++) {
            await axios.post(webhookURL.records[index].config.webhookURL, config)
                .then((res) => {
                    try {
                        if (res.data == "1") {
                            notificationSent = true;
                        }
                        else {
                            notificationSent = false;
                            error_message = d.data;
                            transaction.rollback();
                        }
                    } catch (error) {
                        transaction.rollback();
                        logger.log({
                            level: 'error',
                            message: 'error while sending team' + thresholdAlertEmail ? ' for threshold alert' : '',
                            errMsg: error,
                        });
                    }
                })
                .catch((error) => {
                    logger.log({
                        level: 'error',
                        message: 'error while sending team message ' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : '',
                        errMsg: error,
                    });
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reportData['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: "team " + error,
                        thresholdMet: reportData.report_obj.thresholdAlert,
                        notificationSent: false,
                        channel: 'Teams'
                    });
                })
        }

        logger.log({
            level: 'info',
            message: 'team message send ' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : ''
        });
    } catch (error) {
        await transaction.rollback();
        logger.log({
            level: 'error',
            message: 'error while inserting team message in data base ' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : '',
            errMsg: error,
        });
    }


}
