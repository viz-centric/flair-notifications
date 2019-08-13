
var models = require('../database/models/index');
var db = require('../database/models/index');
var scheduler = require('./shedular.service');
var moment = require('moment');
var schedulerDTO = require('../database/DTOs/schedulerDTO');
var execution=require('./build-visualization-sendmail.service');
var buildVisualizationService=require('./build-visualization.service');
var logger = require('../logger');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;
const defaultPage=0;
const defaultPageSize=10;

var job = {
    createJob: async function (params) {

        
            const transaction = await db.sequelize.transaction();
            try {
                //create report object
                let report = await models.Report.create({
                    dashboard_name: params.report.dashboard_name,
                    view_name: params.report.view_name,
                    share_link: params.report.share_link,
                    build_url:params.report.build_url,
                    mail_body: params.report.mail_body,
                    subject: params.report.subject,
                    report_name: params.report.report_name,
                    title_name: params.report.title_name,
                    userid:params.report.userid,
                    thresholdAlert:params.report.thresholdAlert
                }, { transaction });

                let report_line_item = await models.ReportLineItem.create({
                    ReportId: report.id,
                    visualizationid:params.report_line_item.visualizationid,
                    viz_type: params.report_line_item.visualization,
                    dimension: params.report_line_item.dimension,
                    measure: params.report_line_item.measure,
                    query:JSON.parse(params.query),
                }, { transaction })

                let assign_report_obj = await models.AssignReport.create({
                    ReportId: report.id,
                    channel: params.assign_report.channel,
                    email_list: params.assign_report.email_list,
                }, { transaction })

                let shedualar_obj = await models.SchedulerTask.create({
                    ReportId: report.id,
                    cron_exp: params.schedule.cron_exp,
                    active: true,
                    timezone: params.schedule.timezone,
                    start_date: moment(params.schedule.start_date),
                    end_date: moment(params.schedule.end_date)
                }, { transaction })

                job = scheduler.shedulJob(report_line_item.visualizationid,shedualar_obj.cron_exp,shedualar_obj.start_date,shedualar_obj.end_date)
                if(job===null){
                    job = scheduler.shedulJob(report_line_item.visualizationid,shedualar_obj.cron_exp)
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
                if (ex.name=="SequelizeUniqueConstraintError"){
                    logger.log({
                        level: 'info',
                        message: 'report already exist',
                      });
                    var response = { success: 0, message: "report with this visulaizationid already exit" }
                    return response;
                }
                logger.log({
                    level: 'error',
                    message: 'error while saving report into database',
                    error: ex,
                  });
                return { success: 0, message: ex };
            }
        

    },
    modifyJob: async function (report_data) {

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
                    share_link: report_data.report.share_link,
                    build_url:report_data.report.build_url,
                    mail_body: report_data.report.mail_body,
                    subject: report_data.report.subject,
                    report_name: report_data.report.report_name,
                    title_name: report_data.report.title_name,
                    userid:report_data.report.userid,
                    thresholdAlert:report_data.report.thresholdAlert},
                    {where: {
                        id: exist_report.id
                    }}, { transaction });

                let report_line_item = await models.ReportLineItem.update({
                    visualizationid:report_data.report_line_item.visualizationid,
                    viz_type: report_data.report_line_item.visualization,
                    dimension: report_data.report_line_item.dimension,
                    measure: report_data.report_line_item.measure,
                    query:JSON.parse(report_data.query)}, 
                    {where: {
                        ReportId: exist_report.id
                    }}, { transaction });

                let assign_report_obj = await models.AssignReport.update({
                    channel: report_data.assign_report.channel,
                    email_list: report_data.assign_report.email_list,},
                    {where: {
                        ReportId: exist_report.id
                    }}, { transaction });

                let shedualar_obj = await models.SchedulerTask.update({
                    cron_exp: report_data.schedule.cron_exp,
                    active: true,
                    timezone: report_data.schedule.timezone,
                    start_date: moment(report_data.schedule.start_date),
                    end_date: moment(report_data.schedule.end_date)
                }, 
                {where: {
                    ReportId: exist_report.id
                }}, { transaction });

                var job_name="JOB_"+exist_report.reportline.visualizationid;
                var start_date = moment(report_data.schedule.start_date);
                var end_date = moment(report_data.schedule.end_date);
                result = await scheduler.reShedulJob(job_name,start_date,end_date,report_data.schedule.cron_exp)
                await transaction.commit();
                return {
                    success: 1, message: "report is updated", report_name: exist_report.report_name,
                };

            }
            catch (ex) {
                logger.log({
                    level: 'error',
                    message: 'error occured while updating report'+ex.message,
                    errMsg: err,
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

        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.SchedulerTask,
                    },
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where:{ visualizationid: visualizationid }
                    },
                ],
            })
            if (report) {
                try {
                    const transaction = await db.sequelize.transaction();
                    var job_name = "JOB_" + report.reportline.visualizationid;
                    result = scheduler.cancleJob(job_name);
                    if(result){
                        await report.destroy({ force: true })
                        await transaction.commit();
                        return { message: "Scheduled report is cancelled" };
                    }
                    else{
                        return { message: "Scheduled report has already been cancelled" };
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
    jobLogs: async function (visualizationid,page ,pageSize){
        if(!page){
            page=defaultPage;
        }
        if(!pageSize){
            pageSize=defaultPageSize;
        }
        var offset = page * pageSize;
        var limit = pageSize
        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.SchedulerTask,
                    },
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where:{ visualizationid: visualizationid }
                    },
                ],
            })
            if (report) {
                try {
                    var SchedulerLogs = await models.SchedulerTaskLog.findAndCountAll({
                        where: {
                            SchedulerJobId: report.SchedulerTask.id
                        },
                        order: [
                            ['createdAt', 'DESC'],
                        ],
                        limit,
                        offset,
                    })
                    var outputlogs=[]
                    for (var logItem of SchedulerLogs.rows) {
                        var log={}
                        log.task_status=logItem.task_status;
                        log.task_executed=moment(logItem.task_executed).format("DD-MM-YYYY HH:mm")
                        outputlogs.push(log);
                    }
                    return response = {
                           totalRecords:SchedulerLogs.count,
                           SchedulerLogs:outputlogs
                    };
                   
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
    JobsByUser: async function(userName,page,pageSize){
        if(!page){
            page=defaultPage;
        }
        if(!pageSize){
            pageSize=defaultPageSize;
        }
        var offset = page * pageSize;
        var limit = pageSize
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
                        where:{ active: true }
                    }
                ],
                where: {
                    userid:userName,     
                },
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit,
                offset,
            })
            if (reports.length > 0 ) {
                var all_reports=[];
                for (var i=0; i< reports.length; i++){
                   all_reports.push(schedulerDTO(reports[i]))  
                }
                return all_reports;
            }
            else {
                return { message: "Report is not found for the user" };
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
    getJob: async function(visualizationid){
        try {
            var exist_report = await models.Report.findOne({
                include: [
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where:{ visualizationid: visualizationid }
                    },
                    {
                        model: models.AssignReport
                    },
                    {
                        model: models.SchedulerTask,
                        where:{ active: true }
                    }
                ],
            })
            if ( exist_report ) {
                return schedulerDTO(exist_report);
            }
            else {
                return { message: "report is not found for visulization Id : "+visualizationid };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user',
                error: ex,
              });
            return { success: 0, message: ex };
        }


    },
    JobCountByUser: async function(userName){
        try {
            var reportCount = await models.Report.count({
                include: [
                    {
                        model: models.SchedulerTask,
                        where:{ active: true }
                    },
                ],
                where: {
                    userid:userName
                }
            })
            response = { totalReports: reportCount }
            return response;
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports count for user',
                error: ex,
              });
            return  { success: 0, message: ex };
        }


    },
    executeImmediate: async function(visualizationid){
        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.ReportLineItem,
                        as: 'reportline',
                        where:{ visualizationid: visualizationid }
                    },
                    {
                        model: models.AssignReport
                    },
                    {
                        model: models.SchedulerTask,
                        where:{ active: true }
                    }
                ],
            })
            if ( report ) {
                var reports_data={
                    report_obj:report,
                    report_line_obj :report.reportline,
                    report_assign_obj:report.AssignReport,
                    report_shedular_obj:report.SchedulerTask
                }
                execution.loadDataAndSendMail(reports_data,reports_data.report_obj.thresholdAlert);
                if(reports_data.report.thresholdAlert)
                    execution.loadDataAndSendMail(reports_data,reports_data.report_obj.thresholdAlert);
            }
            else {
                return { message: "report is not found for visulization Id : "+visualizationid };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user',
                error: ex,
              });
            return { success: 0, message: ex };
        }


    },
    filterJobs: async function(userName, reportName, startDate, endDate, page, pageSize){

        var reportWhereClause={}
        var schedularWhereClause={}
        userName ? reportWhereClause.userid = userName : null;
        reportName ? reportWhereClause.report_name={[Op.iLike]: '%' + reportName + '%'} : null;
        startDate ? schedularWhereClause.start_date= {[Op.gt]: startDate}: null;
        endDate ? schedularWhereClause.end_date= { [Op.lt]: endDate }: null;
        var page= page ? page : defaultPage;
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
                        where:schedularWhereClause
                    }
                ],
                where: reportWhereClause,
                order: [
                    ['createdAt', 'DESC'],
                ],
                limit,
                offset,
            })
            if (reports.count > 0 ) {
                var all_reports=[];
                for (var report of reports.rows) {
                    all_reports.push(schedulerDTO(report))
                }
                return response = {
                    totalRecords:reports.count,
                    records:all_reports
                   };
            }
            else {
                return { message: "report not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user',
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
                    visualizationId:params.visualizationId,
                    query:JSON.parse(params.query),
                    thresholdAlert:params.thresholdAlert
                };
                buildVisualizationService.loadDataAndBuildVisualization(report,params.thresholdAlert).then(function (visualizationBytes) {
                    resolve(visualizationBytes);
                }).catch(function (error) {
                    reject({message: 'error while generating image'+error });
                });
            }
            catch (ex) {
                logger.log({
                    level: 'error',
                    message: 'error while generating image',
                    error: ex,
                });
                reject({message: 'error while generating image'+ex });
            }
        });
    },
}

module.exports = job;
