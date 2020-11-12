
var models = require('../database/models/index');
var db = require('../database/models/index');
var scheduler = require('../shedular');
var moment = require('moment');
var schedulerDTO = require('../database/DTOs/schedulerDTO');
var execution = require('../execution');
var buildVisualizationService = require('../services/build-visualization.service');
var logger = require('../logger');
const Sequelize = require('sequelize');
const modelsUtil = require('./models-utils');

const Op = Sequelize.Op;
const defaultPage = 0;
const defaultPageSize = 10;

var job = {
    createJob: async function (params) {

        const transaction = await db.sequelize.transaction();
        try {
            //create report object
            let report = await models.Report.create({
                dashboard_name: params.report.dashboard_name,
                view_name: params.report.view_name,
                view_id: params.report.view_id,
                share_link: params.report.share_link,
                build_url: params.report.build_url,
                mail_body: params.report.mail_body,
                subject: params.report.subject,
                report_name: params.report.report_name,
                title_name: params.report.title_name,
                userid: params.report.userid,
                thresholdAlert: params.report.thresholdAlert
            }, { transaction });

            let assign_report_obj = await models.AssignReport.create({
                ReportId: report.id,
                channel: params.assign_report.channel,
                communication_list: params.assign_report.communication_list,
            }, { transaction })

            let report_line_item = await models.ReportLineItem.create({
                ReportId: report.id,
                visualizationid: params.report_line_item.visualizationid,
                viz_type: params.report_line_item.visualization,
                dimension: params.report_line_item.dimension,
                measure: params.report_line_item.measure,
                query: JSON.parse(params.query),
            }, { transaction })

            let shedualar_obj = await models.SchedulerTask.create({
                ReportId: report.id,
                // channel: "channel",
                cron_exp: params.schedule.cron_exp,
                active: true,
                timezone: params.schedule.timezone,
                start_date: moment(params.schedule.start_date),
                end_date: moment(params.schedule.end_date)
            }, { transaction })

            let constraints_obj = await models.ReportConstraint.create({
                ReportId: report.id,
                constraints: JSON.parse(params.constraints),
            }, { transaction });

            logger.log({
                level: 'info',
                message: 'new report shedule for channel ',
                report_name: report.report_name,
            });

            job = scheduler.shedulJob(report_line_item.visualizationid, shedualar_obj.cron_exp, shedualar_obj.start_date, shedualar_obj.end_date)
            if (job === null) {
                job = scheduler.shedulJob(report_line_item.visualizationid, shedualar_obj.cron_exp)
            }

            await transaction.commit();

            logger.log({
                level: 'info',
                message: 'new report is saved into database',
                report_name: report.report_name,
            });
            return {
                success: 1, message: "Report is scheduled successfully", report_name: report.report_name,
                job_id: shedualar_obj.id, next_run: job.nextInvocation()
            };

        }
        catch (ex) {
            await transaction.rollback();
            if (ex.name == "SequelizeUniqueConstraintError") {
                logger.log({
                    level: 'info',
                    message: 'report already exist',
                });
                var response = { success: 0, message: "report with this visulaizationid already exit" }
                return response;
            }
            logger.log({
                level: 'error',
                message: 'error while saving report into database ' + ex,
                error: ex,
            });
            return { success: 0, message: ex };
        }


    },
    modifyJob: async function (report_data) {
        logger.info('Modifying job', report_data.report_line_item.visualizationid);
        exist_report = await models.Report.findOne({
            include: [
                {
                    model: models.ReportLineItem,
                    as: 'reportline',
                    where: {
                        visualizationid: report_data.report_line_item.visualizationid
                    }
                },
                {
                    model: models.AssignReport,
                },
                {
                    model: models.SchedulerTask,
                },
                {
                    model: models.ReportConstraint,
                }
            ],

        })
        if (exist_report) {
            const transaction = await db.sequelize.transaction();
            try {
                //update report object
                let report = await models.Report.update({
                    dashboard_name: report_data.report.dashboard_name,
                    view_name: report_data.report.view_name,
                    view_id: report_data.report.view_id,
                    share_link: report_data.report.share_link,
                    build_url: report_data.report.build_url,
                    mail_body: report_data.report.mail_body,
                    subject: report_data.report.subject,
                    report_name: report_data.report.report_name,
                    title_name: report_data.report.title_name,
                    userid: report_data.report.userid,
                    thresholdAlert: report_data.report.thresholdAlert
                },
                    {
                        where: {
                            id: exist_report.id
                        }
                    }, { transaction });

                let report_line_item = await models.ReportLineItem.update({
                    visualizationid: report_data.report_line_item.visualizationid,
                    viz_type: report_data.report_line_item.visualization,
                    dimension: report_data.report_line_item.dimension,
                    measure: report_data.report_line_item.measure,
                    query: JSON.parse(report_data.query)
                },
                    {
                        where: {
                            ReportId: exist_report.id
                        }
                    }, { transaction });

                let assign_report_obj = await models.AssignReport.update({
                    channel: report_data.assign_report.channel,
                    communication_list: report_data.assign_report.communication_list,
                },
                    {
                        where: {
                            ReportId: exist_report.id
                        }
                    }, { transaction });

                let constraints_obj = await models.ReportConstraint.update({
                    constraints: JSON.parse(report_data.constraints),
                },
                    {
                        where: {
                            ReportId: exist_report.id
                        }
                    }, { transaction });

                let shedualar_obj = await models.SchedulerTask.update({
                    cron_exp: report_data.schedule.cron_exp,
                    active: true,
                    timezone: report_data.schedule.timezone,
                    start_date: moment(report_data.schedule.start_date),
                    end_date: moment(report_data.schedule.end_date)
                },
                    {
                        where: {
                            ReportId: exist_report.id
                        }
                    }, { transaction });

                var job_name = "JOB_" + exist_report.reportline.visualizationid;
                var start_date = moment(report_data.schedule.start_date);
                var end_date = moment(report_data.schedule.end_date);
                result = await scheduler.reShedulJob(job_name, start_date, end_date, report_data.schedule.cron_exp)
                await transaction.commit();
                return {
                    success: 1, message: "report is updated", report_name: exist_report.report_name,
                };

            }
            catch (ex) {
                logger.log({
                    level: 'error',
                    message: 'error occured while updating report' + ex.message,
                    errMsg: ex.message,
                });
                await transaction.rollback();
                return { success: 0, message: ex };
            }

        }
        else {
            return { success: 0, message: "report is not found" };
        }

    },
    deleteJob: async function (visualizationid) {
        logger.info(`Deleting job ${visualizationid}`);
        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.SchedulerTask,
                    },
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where: { visualizationid: visualizationid }
                    },
                    {
                        model: models.ReportConstraint
                    }
                ],
            });
            if (report) {
                try {
                    const transaction = await db.sequelize.transaction();
                    var job_name = "JOB_" + report.reportline.visualizationid;
                    var result = scheduler.cancleJob(job_name);
                    if (result) {
                        await report.destroy({ force: true });
                        await transaction.commit();
                        return { success: 1 };
                    }
                    else {
                        return { success: 0, message: "Scheduled report has already been cancelled" };
                    }

                }
                catch (ex) {
                    return { success: 0, message: ex };
                }

            }
            else {
                return { success: 0, message: "Report is not found" };
            }
        }
        catch (ex) {
            return { success: 0, message: ex };
        }

    },
    jobLogs: async function (visualizationid, page, pageSize) {
        if (!page) {
            page = defaultPage;
        }
        if (!pageSize) {
            pageSize = defaultPageSize;
        }
        var offset = page * pageSize;
        var limit = pageSize;
        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.SchedulerTask,
                    },
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where: { visualizationid: visualizationid }
                    },
                    {
                        model: models.ReportConstraint
                    }
                ],
            });
            if (report) {
                try {
                    var SchedulerLogs = await models.SchedulerTaskLog.findAndCountAll({
                        include: [
                            {
                                model: models.SchedulerTaskMeta,
                            }
                        ],
                        where: {
                            SchedulerJobId: report.SchedulerTask.id
                        },
                        order: [
                            ['createdAt', 'DESC'],
                        ],
                        limit,
                        offset,
                    });
                    if (SchedulerLogs) {
                        return await modelsUtil.getReportLogs(SchedulerLogs, report);
                    }

                }
                catch (ex) {
                    return { success: 0, message: ex };
                }

            }
            else {
                return { success: 0, message: "Report is not found" };
            }
        }
        catch (ex) {
            return { success: 0, message: ex };
        }
    },
    JobsByUser: async function (userName, page, pageSize) {
        logger.info(`Get jobs by user ${userName} page ${page} size ${pageSize}`);
        if (!page) {
            page = defaultPage;
        }
        if (!pageSize) {
            pageSize = defaultPageSize;
        }
        var offset = page * pageSize;
        var limit = pageSize;
        try {
            var reports = await models.Report.findAll({
                include: [
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                    },
                    {
                        model: models.AssignReport
                    },
                    {
                        model: models.SchedulerTask,
                        where: { active: true }
                    },
                    {
                        model: models.ReportConstraint
                    }
                ],
                where: {
                    userid: userName,
                },
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit,
                offset,
            });
            var all_reports = [];
            if (reports.length > 0) {

                for (var i = 0; i < reports.length; i++) {
                    all_reports.push(schedulerDTO(reports[i]))
                }
                return { success: 1, reports: all_reports };
            }
            else {
                return { success: 0, message: "Report is not found for the user" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for the user',
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },
    getJob: async function (visualizationid) {
        logger.info(`Get job for vizualization id ${visualizationid}`);
        try {
            var exist_report = await models.Report.findOne({
                include: [
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where: { visualizationid: visualizationid }
                    },
                    {
                        model: models.AssignReport
                    },
                    {
                        model: models.SchedulerTask,
                        where: { active: true }
                    },
                    {
                        model: models.ReportConstraint
                    }
                ],
            });
            if (exist_report) {
                logger.info(`Get job for visualization id ${visualizationid} was found`, exist_report.id);
                return {
                    success: 1,
                    job: schedulerDTO(exist_report)
                };
            } else {
                logger.info(`Get job for visualization id ${visualizationid} was not found`);
                return {
                    message: `report is not found for visulization Id : ${visualizationid}`,
                    success: 1
                };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user ' + ex,
                error: ex,
            });
            return {
                success: 0,
                message: ex
            };
        }
    },
    JobCountByUser: async function (username) {
        logger.info(`Job count by user ${username}`);
        var reportCount = await models.Report.count({
            include: [
                {
                    model: models.SchedulerTask,
                    where: { active: true }
                },
            ],
            where: {
                userid: username
            }
        });
        return { totalReports: reportCount };
    },
    executeImmediate: async function (visualizationid, options) {
        logger.info(`Job execute report ${visualizationid} caller ${options}`);
        var report = await models.Report.findOne({
            include: [
                {
                    model: models.ReportLineItem,
                    as: 'reportline',
                    where: { visualizationid: visualizationid }
                },
                {
                    model: models.AssignReport
                },
                {
                    model: models.SchedulerTask,
                    where: { active: true }
                },
                {
                    model: models.ReportConstraint
                }
            ],
        });
        if (report) {
            var reports_data = {
                report_obj: report,
                report_line_obj: report.reportline,
                report_assign_obj: report.AssignReport,
                report_shedular_obj: report.SchedulerTask
            };
            execution.loadDataAndSendNotification(reports_data, options);
            return {};
        } else {
            return { message: `report is not found for visulization Id : ${visualizationid}` };
        }
    },
    filterJobs: async function (userName, reportName, startDate, endDate, page, pageSize, thresholdAlert,dashboardName,viewName) {

        var reportWhereClause = {}
        var schedularWhereClause = {}
        userName ? reportWhereClause.userid = userName : null;
        reportName ? reportWhereClause.title_name = { [Op.iLike]: '%' + reportName + '%' } : null;
        startDate ? schedularWhereClause.start_date = { [Op.gt]: startDate } : null;
        endDate ? schedularWhereClause.end_date = { [Op.lt]: endDate } : null;
        thresholdAlert ? reportWhereClause.thresholdAlert = thresholdAlert : null;
        dashboardName ? reportWhereClause.dashboard_name = dashboardName : null;
        viewName ? reportWhereClause.view_name = viewName : null;
        var page = page ? page : defaultPage;
        var pageSize = pageSize ? pageSize : defaultPageSize;

        var offset = page * pageSize;
        var limit = pageSize

        try {
            var reports = await models.Report.findAndCountAll({
                include: [
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                    },
                    {
                        model: models.AssignReport
                    },
                    {
                        model: models.SchedulerTask,
                        where: schedularWhereClause
                    },
                    {
                        model: models.ReportConstraint
                    }
                ],
                where: reportWhereClause,
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit,
                offset,
            });
            if (reports.count > 0) {
                var all_reports = [];
                for (var report of reports.rows) {
                    all_reports.push(schedulerDTO(report))
                }
                return {
                    success: 1,
                    totalRecords: reports.count,
                    records: all_reports
                };
            }
            else {
                return { success: 0, message: "report not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user ' + ex,
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },
    buildVisualizationImage: function (params) {
        return new Promise((resolve, reject) => {
            try {
                let report = {
                    userId: params.userId,
                    reportName: params.reportName,
                    titleName: params.titleName,
                    dimension: params.dimension,
                    measure: params.measure,
                    visualization: params.visualization,
                    visualizationId: params.visualizationId,
                    query: JSON.parse(params.query),
                    thresholdAlert: params.thresholdAlert
                };
                buildVisualizationService.loadDataAndBuildVisualization(report, params.thresholdAlert).then(function (visualizationBytes) {
                    resolve(visualizationBytes);
                }).catch(function (error) {
                    reject({ message: 'error occurred while generating visualization' + error });
                });
            }
            catch (ex) {
                logger.log({
                    level: 'error',
                    message: 'error occurred while generating visualization',
                    error: ex,
                });
                reject({ message: 'error occurred while generating visualization' + ex });
            }
        });
    },
    getSchedulerMetaData: async function (id) {
        try {
            var SchedulerLogs = await models.SchedulerTaskMeta.findOne({
                where: {
                    id: id
                }
            });
            return SchedulerLogs;
        } catch (error) {
            logger.log({
                level: 'error',
                message: 'Scheduler metadata is not found',
                error: ex.getMessage(),
            });
            return "Scheduler metadata is not found";
        }

    },

    disableTicketCreation: async function (params) {
        try {

            var exist_log = await models.SchedulerTaskMeta.findOne({
                include: [
                    {
                        model: models.SchedulerTaskLog,
                    }],
                where: {
                    id: params.schedulerTaskLogId
                }
            })
            if (exist_log) {
                const transaction = await db.sequelize.transaction();
                try {
                    let log = await models.SchedulerTaskLog.update({
                        enableTicketCreation: !exist_log.SchedulerTaskLog.enableTicketCreation
                    },
                        {
                            where: {
                                id: exist_log.SchedulerTaskLog.id
                            }
                        }, { transaction });

                    transaction.commit();
                    logger.info('Enable ticket creation updated successfully for id' + params.schedulerTaskLogId)
                    return { success: 1, message: "Enable ticket creation updated successfully" };
                }
                catch (error) {
                    logger.log({
                        level: 'error',
                        message: 'error occured while updating scheduler logs',
                        errMsg: error,
                    });
                    await transaction.rollback();
                    return { success: 0, message: error };
                }
            }

        } catch (error) {
            logger.log({
                level: 'error',
                message: 'Scheduler not found id: ' + params.schedulerTaskLogId,
                errMsg: error,
            });
        }

    }
};

module.exports = job;
