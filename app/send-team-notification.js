
const axios = require('axios');
var models = require('./database/models/index');
var logger = require('./logger');
const channelJob = require('./jobs/channelJobs');
const db = require('./database/models/index');
var moment = require('moment');
const util = require('./util');
var config = require('./jobs/team-message-payload')

exports.sendTeamNotification = async function sendNotification(teamConfig, reportData) {
    config.title = teamConfig.reportTitle;
    var tablekey = Object.keys(teamConfig.tableData[0]);
    var table = "<table><tr style='border:1px solid #e1e3e3'>";
    for (var j = 0; j < tablekey.length; j++) {
        table += "<th>" + tablekey[j] + "</th>";
    }
    table += "</tr><tbody>";
    for (let index = 0; index < teamConfig.tableData.length; index++) {
        const element = teamConfig.tableData[index];
        table += "<tr style='border:1px solid #e1e3e3'>";
        for (var j = 0; j < tablekey.length; j++) {
            table += "<td>" + element[tablekey[j]] + "</td>";
        }
        table += "</tr>";
    }
    table += "</tr></tbody><table>";
    config.sections[0].text = table;
    config.sections[0].summary = table;
    config.sections[0].facts[0].value = teamConfig.dashboard;
    config.sections[0].facts[1].value = teamConfig.view;
    config.sections[0].activitySubtitle = teamConfig.description;
    config.potentialAction[0].targets[0].uri = teamConfig.shareLink;
    config.potentialAction[1].targets[0].uri = teamConfig.buildUrl;

    webhookURL = await channelJob.getWebhookList(teamConfig.webhookURL); //[1]

    var notificationSent = true, error_message = "";

    var transaction = await db.sequelize.transaction();
    try {
        let shedularlog = await models.SchedulerTaskLog.create({
            SchedulerJobId: reportData['report_shedular_obj']['id'],
            task_executed: new Date(Date.now()).toISOString(),
            task_status: "success",
            enableTicketCreation: true,
            thresholdMet: reportData.report_obj.thresholdAlert ? true : false,
            notificationSent: notificationSent,
            channel: 'Teams'
        }, { transaction });

        var schedulerTaskMeta;

        schedulerTaskMeta = await models.SchedulerTaskMeta.create({
            SchedulerTaskLogId: shedularlog.id,
            rawQuery: teamConfig.rawQuery,
        }, { transaction });

        await transaction.commit();

        thresholdTime = "Threshold run at " + moment(schedulerTaskMeta.createdAt).format(util.dateFormat());

        config.potentialAction[2].targets[0].uri = util.getViewDataURL(teamConfig.shareLink, schedulerTaskMeta.id);
        config.potentialAction[3].targets[0].uri = flairInsightsLink = util.getGlairInsightsLink(teamConfig.shareLink, teamConfig.visualizationId)
        config.text = thresholdTime + ' ![chart image](' + teamConfig.base64 + ')';

        const updateTransaction = await db.sequelize.transaction();

        await models.SchedulerTaskMeta.update({
            viewData: config.potentialAction[2].targets[0].uri
        }, {
            where: {
                id: schedulerTaskMeta.id
            }
        }, { updateTransaction });

        await updateTransaction.commit();

        for (let index = 0; index < webhookURL.records.length; index++) {
            await axios.post(webhookURL.records[index].config.webhookURL, config)
                .then(async (res) => {
                    try {
                        if (res.data == "1") {
                            notificationSent = true;
                        }
                        else {
                            var _transaction = await db.sequelize.transaction();
                            notificationSent = false;
                            error_message = res.data;

                            var log = await models.SchedulerTaskLog.findOne({
                                where: {
                                    id: shedularlog.id
                                }
                            })

                            await models.SchedulerTaskLog.update({
                                task_status: error_message,
                                notificationSent: false
                            },
                                {
                                    where: {
                                        id: shedularlog.id
                                    }
                                }, { _transaction });
                            _transaction.commit();
                        }


                    } catch (error) {
                        transaction.rollback();
                        logger.log({
                            level: 'error',
                            message: 'error occurred while sending team' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : '',
                            errMsg: error,
                        });
                    }
                })
                .catch((error) => {
                    logger.log({
                        level: 'error',
                        message: 'error occurred while sending team message ' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : '',
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
            message: 'error occurred while inserting team message in data base ' + reportData.report_obj.thresholdAlert ? ' for threshold alert' : '',
            errMsg: error,
        });
    }


}
