var scheduler = require('node-schedule');
var models = require('./database/models/index');
var moment = require('moment');
var execution = require('./execution');
var logger = require('./logger');

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
                        }
                    ],
                }).then(function (report) {
                    var reports_data = {
                        report_obj: report,
                        report_line_obj: report.reportline,
                        report_assign_obj: report.AssignReport,
                        report_shedular_obj: report.SchedulerTask
                    }
                    execution.loadDataAndSendNotification(reports_data, reports_data.report_obj.thresholdAlert);

                }).catch(function (err) {
                    logger.log({
                        level: 'error',
                        message: 'error while generationg reports',
                        errMsg: err,
                    });
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reports_data['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: ex,
                        threshold_met: reports_data.Report.thresholdAlert,
                        notification_sent: false,
                        channel: reports_data.SchedulerTask.channel
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
    }
}

module.exports = shedular;
