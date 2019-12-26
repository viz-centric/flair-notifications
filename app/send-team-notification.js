
const axios = require('axios');
var models = require('./database/models/index');
var logger = require('./logger');
const channelJob = require('./jobs/channelJobs');

let config;

let WebhookURL = 'https://outlook.office.com/webhook/f79eb495-6984-4ca3-bf67-5357e4f9edd5@2c081cf3-e47d-4c70-a618-68662c113c38/IncomingWebhook/b7fc7559a6b34d87b1a05d26d1a830b8/90ac3273-dc32-484d-ba49-b6ea1b4fcd4f';
let base64 = '';

config = {
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
            "name": "Task Logger",
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
    config.sections[0].facts[0].value = teamConfig.dashboard;
    config.sections[0].facts[1].value = teamConfig.view;
    config.sections[0].activitySubtitle = teamConfig.description;
    config.potentialAction[0].targets[0].uri = teamConfig.share_link;
    config.potentialAction[1].targets[0].uri = teamConfig.build_url;
    config.potentialAction[2].targets[0].uri = teamConfig.share_link.replace('visual', 'visual-table');

    config.text = '![chart image](' + teamConfig.base64 + ')';

    webhookURL = await channelJob.getWebhookList(teamConfig.webhookURL); //[1]

    var notification_sent = false;
    for (let index = 0; index < webhookURL.records.length; index++) {

        await axios.post(webhookURL.records[index].config.webhook, config)
            .then((res) => {
                try {
                    if (res.data == "1") {
                        notification_sent = true;
                    }
                    else {
                        notification_sent = false;
                    }
                } catch (error) {
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
                    threshold_met: reportData.report_obj.thresholdAlert,
                    notification_sent: false,
                    channel: reportData.report_shedular_obj.channel
                });
            })
    }
    let shedularlog = models.SchedulerTaskLog.create({
        SchedulerJobId: reportData['report_shedular_obj']['id'],
        task_executed: new Date(Date.now()).toISOString(),
        task_status: notification_sent == true ? "success" : "team " + error,
        threshold_met: reportData.report_obj.thresholdAlert,
        notification_sent: notification_sent,
        channel: reportData.report_shedular_obj.channel
    });
}