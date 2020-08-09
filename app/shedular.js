var scheduler = require('node-schedule');
var models = require('./database/models/index');
var moment = require('moment');
var execution = require('./execution');
var logger = require('./logger');
var channelJobs = require('./jobs/channelJobs');
var util = require('./util');

const AppConfig = require('./jobs/load-notification-config');

var shedular = {
    shedulJob: function (visualizationid, cron_exp, start_date, end_date) {
        if (start_date && end_date) {
            var cron_expression = {
                start: moment(start_date).toDate(),
                end: moment(end_date).toDate(),
                rule: cron_exp
            };
        }
        else {
            var cron_expression = cron_exp;
        }

        var job_name = "JOB_" + visualizationid;
        var reports_data = {};
        var job = scheduler.scheduleJob(job_name, cron_expression, function (visualizationid) {
            logger.log({
                level: 'info',
                message: 'report execution started ',
                visualizationid: visualizationid,
            });
            try {
                models.Report.findOne({
                    include: [
                        {
                            model: models.ReportLineItem,
                            as: 'reportline',
                            where: {
                                visualizationid: visualizationid
                            }
                        },
                        {
                            model: models.AssignReport,
                        },
                        {
                            model: models.SchedulerTask,
                            where: {
                                active: true
                            },
                        },
                        {
                            model: models.ReportConstraint
                        }
                    ],
                }).then(function (report) {
                    reports_data = {
                        report_obj: report,
                        report_line_obj: report.reportline,
                        report_assign_obj: report.AssignReport,
                        report_shedular_obj: report.SchedulerTask
                    }

                    logger.info('shedular run for id: '+reports_data.report_line_obj.visualizationid+" name: "+reports_data.report_obj.title_name);
                    execution.loadDataAndSendNotification(reports_data);

                }).catch(function (err) {

                    logger.log({
                        level: 'error',
                        message: 'error while generationg reports',
                        errMsg: err,
                    });
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reports_data['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: 'error while generationg reports',
                        thresholdMet: reports_data.report_obj.thresholdAlert,
                        notificationSent: false
                    });
                });

            }
            catch (ex) {
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: ex,
                });
            }
        }.bind(null, visualizationid));
        return job;

    },
    cancleJob: function (jobName) {
        all_jobs = scheduler.scheduledJobs
        if (jobName in all_jobs) {
            all_jobs[jobName].cancel()
            return true
        }
        else {
            return false;
        }


    },
    reShedulJob: function (jobName, start_date, end_date, cron_exp) {
        let cron_expression = {
            start: moment(start_date).toDate(),
            end: moment(end_date).toDate(),
            rule: cron_exp
        };
        all_jobs = scheduler.scheduledJobs;
        result = all_jobs[jobName].reschedule(cron_expression);
        return result;
    },
    notifyOpenedTicket: async function () {
        try {
            const config = await AppConfig.getConfig();
            var channelList = util.channelList();
            var job = scheduler.scheduleJob(config.notifyOpenedTicketJobCron, function () {
                var config = {
                    channels: [channelList.email]
                }
                channelJobs.sentMailForOpenTickets(config);
            });
        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error occured while scheduling job for open Tickets'
            });
        }

    },
}

module.exports = shedular;
