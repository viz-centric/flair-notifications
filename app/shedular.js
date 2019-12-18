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
                models.Report.findAll({
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
                }).then(function (reports) {
                    for (var i = 0; i < reports.length; i++) {

                        job = shedular.shedulJob(reports[i].reportline.visualizationid, reports[i].SchedulerTask.cron_exp,
                            reports[i].SchedulerTask.start_date, reports[i].SchedulerTask.end_date)
                        if (job === null) {
                            job = shedular.shedulJob(reports[i].reportline.visualizationid, reports[i].SchedulerTask.cron_exp)
                        }

                    }

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
                        threshold_met: false,
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
