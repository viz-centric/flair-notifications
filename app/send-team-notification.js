
const axios = require('axios');
var models = require('./database/models/index');
var logger = require('./logger');

let config;

let WebhookURL = 'https://outlook.office.com/webhook/f79eb495-6984-4ca3-bf67-5357e4f9edd5@2c081cf3-e47d-4c70-a618-68662c113c38/IncomingWebhook/b7fc7559a6b34d87b1a05d26d1a830b8/90ac3273-dc32-484d-ba49-b6ea1b4fcd4f';
let base64 = '';

config = {
    "@type": "MessageCard",
    "@context": "http://schema.org/extensions",
    "themeColor": "0076D7",
    "text": "![Alt text for the image](https://lh3.googleusercontent.com/QCaTUJjRbD00fwTwcrFCEtF9nJOvPd5FlC4skeBbgoq0WwiP-Q3DCXNHhOS0fbHGX9OJf_1ULetoj2AMqtlw3gBJ8Cx7HEoLAjc7yFtYBAeWEHIwCYpK9zOvpgwiXM8XAmGJLT8FMmMWRspkXIJVTS2XIcYs5L2cpd8wfLSvsrYwiuLhENc_gjHhBKPgD6g-ecWpWjc6o04dhWpEO08gVGGhUZ4MvgldTb1NKHislqmcv18FUcVxX8CufKiUDnpPohAUEnoAFFDjy6dcqc7eWAtV5gFp89c9re1bHXUdniQW0TDo1uSnEmo532QlqhCorGY-jrGRFeFKjUqa19kHi_EGuRDyrPTlYwpAOEorfdFzpaTI3H6fqRnPldXcqfhG-zB6_27GZKj_40jVdmowZ4GKFnwWWlZzg_ssdp5_BgOh0JonkZTJWvW4vH4AjKb0fzfxZRD_zK76A9IiD3i0ugFxz0xnInSd8DpRFVAc8snb-jPWonVmugSekDbx7xPiEjPUGMg6AgvrnuOebX2rXqzXKAKZ6nVlco_5fqSzh-fuoO1N93hJFffaB-SQa9-jU1l_ovnMNPduzGrmAh8yKAvihpoMS299km6k-3hBibYwq5GOAnMi1kmqVrbHBDN-P7NuJ1BTbxK4qlKXiwdlzJ9JM7c6w2uZgGTPr4G3lZoyZEnWaHm25J_ZwKIGGQ=w1315-h669-ft)",
    "title": "Clustered Vertical Bar Chart",
    "summary": "Larry Bryant created a new task",
    "sections": [{
        "facts": [{
            "name": "Deshboaed: ",
            "value": "Order Summery"
        }, {
            "name": "View",
            "value": "Order View"
        }],
        "activitySubtitle": "Larry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new taskLarry Bryant created a new task",

        "markdown": true
    }],
    "potentialAction": [
        {
            "@type": "OpenUri",
            "name": "Goto View",
            "targets": [
                { "os": "default", "uri": "https://docs.microsoft.com/outlook/actionable-messages" }
            ]
        },
        {
            "@type": "OpenUri",
            "name": "Goto Deashboard",
            "targets": [
                { "os": "default", "uri": "https://docs.microsoft.com/outlook/actionable-messages" }
            ]
        }
    ]
}


exports.sendTeamNotification = function sendNotification(teamConfig, reportData) {

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
    config.potentialAction[0].targets[0].uri = teamConfig.build_url;
    config.potentialAction[1].targets[0].uri = teamConfig.share_link;
    config.text = '![chart image](' + teamConfig.base64 + ')';
    
    // webhookURL=webhookURL;
    axios.post(WebhookURL, config)
        .then((res) => {
            try {
                if (res.data == "1") {
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reportData['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: "success",
                        threshold_met: reportData.report_obj.thresholdAlert,
                        notification_sent: true,
                        channel: reportData.report_shedular_obj.channel
                    });
                }
                else {
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reportData['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: "Error while seding message to team " + res.data,
                        threshold_met: reportData.report_obj.thresholdAlert,
                        notification_sent: true,
                        channel: reportData.report_shedular_obj.channel
                    });
                }
            } catch (error) {
                logger.log({
                    level: 'error',
                    message: 'error while sending team' + thresholdAlertEmail ? ' for threshold alert' : '',
                    errMsg: error,
                });
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reportData['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: "team " + error,
                    threshold_met: reportData.report_obj.thresholdAlert,
                    notification_sent: true,
                    channel: reportData.report_shedular_obj.channel
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
                notification_sent: true,
                channel: reportData.report_shedular_obj.channel
            });
        })
}