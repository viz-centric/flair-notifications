
var models = require('./database/models/index');
var db = require('./database/models/index');
var scheduler = require('./shedular');
var moment = require('moment');
var schedulerDTO = require('./database/DTOs/schedulerDTO');
var logger = require('./logger');

var job = {
    createJob: async function (params) {

        exist_report = await models.Report.findOne({
            where: {
                report_name: params.report.report_name
            }
        })
        if (!exist_report) {
            const transaction = await db.sequelize.transaction();
            try {
                //create report object
                let report = await models.Report.create({
                    connection_name: params.report.connection_name,
                    mail_body: params.report.mail_body,
                    subject: params.report.subject,
                    report_name: params.report.report_name,
                    source_id: params.report.source_id,
                    title_name: params.report.title_name,
                    userid:params.report.userid,
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
                    condition: params.assign_report.condition,
                }, { transaction })

                let shedualar_obj = await models.SchedulerTask.create({
                    ReportId: report.id,
                    cron_exp: params.schedule.cron_exp,
                    active: true,
                    timezone: params.schedule.timezone,
                    start_date: moment(params.schedule.start_date),
                    end_date: moment(params.schedule.end_date)
                }, { transaction })
                job = scheduler.shedulJob(report.report_name,shedualar_obj.cron_exp,shedualar_obj.start_date,shedualar_obj.end_date)
                if(job===null){
                    job = scheduler.shedulJob(report.report_name,shedualar_obj.cron_exp)
                }
                await transaction.commit();
                var response = {
                    success: 1, message: "Report is scheduled successfully", report_name: report.report_name,
                    job_id: shedualar_obj.id, next_run: job.nextInvocation()
                }
                logger.log({
                    level: 'info',
                    message: 'new report is saved into database',
                    report_name: report.report_name,
                  });
                return response;

            }
            catch (ex) {
                await transaction.rollback();
                var response = { success: 0, message: ex }
                logger.log({
                    level: 'error',
                    message: 'error while saving report into database',
                    error: ex,
                  });
                return response;
            }

        }
        else {
            logger.log({
                level: 'info',
                message: 'report already exist',
              });
            var response = { success: 0, message: "report with this name already exit" }
            return response;
        }

    },
    modifyJob: async function (report_data) {

        exist_report = await models.Report.findOne({
            include: [
                {
                    model: models.ReportLineItem,
                    as: 'reportline',
                },
                {
                    model: models.AssignReport,
                },
                {
                    model: models.SchedulerTask,
                },
            ],
            where: {
                report_name: report_data.report.report_name
            }

        })
        if (exist_report) {
            const transaction = await db.sequelize.transaction();
            try {
                //update report object
                let report = await models.Report.update({
                    connection_name: report_data.report.connection_name,
                    mail_body: report_data.report.mail_body,
                    subject: report_data.report.subject,
                    report_name: report_data.report.report_name,
                    source_id: report_data.report.source_id,
                    title_name: report_data.report.title_name,
                    userid:report_data.report.userid,},
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
                    email_list: report_data.assign_report.email_list,
                    condition: report_data.assign_report.condition,},
                    {where: {
                        ReportId: exist_report.id
                    }}, { transaction });

                let shedualar_obj = await models.SchedulerTask.update({
                    cron_exp: report_data.cron_exp,
                    active: true,
                    timezone: report_data.schedule.timezone,
                    start_date: moment(report_data.schedule.start_date),
                    end_date: moment(report_data.schedule.end_date)
                }, 
                {where: {
                    ReportId: exist_report.id
                }}, { transaction });
                var job_name="JOB_"+exist_report.report_name;
                result = await scheduler.reShedulJob(job_name,shedualar_obj.start_date,shedualar_obj.end_date,shedualar_obj.cron_exp)
                await transaction.commit();
                var response = {
                    success: 1, message: "modified", report_name: exist_report.report_name,
                }
                return response;

            }
            catch (ex) {
                await transaction.rollback();
                var response = { success: 0, message: ex }
                return response;
            }

        }
        else {
            var response = { success: 0, message: "report does not exit" }
            return response;
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
                    var job_name = "JOB_" + report.report_name;
                    result = scheduler.cancleJob(job_name);
                    if(result){
                        await models.SchedulerTask.update(
                            { active: false },
                            { where: {id:report.SchedulerTask.id}}, { transaction })
                        await transaction.commit();
                        var response = { message: "Cancled" }
                        return response;
                    }
                    else{
                        var response = { message: "Job already Cancled" }
                        return response;
                    }
                   
                }
                catch (ex) {
                    var response = { success: 0, message: ex }
                    return response;
                }

            }
            else {
                var response = { success: 0, message: "Report Not Exist" }
                return response;
            }
        }
        catch (ex) {
            var response = { success: 0, message: ex }
            return response;
        }

    },
    jobLogs: async function (report_name){
        try {
            var report = await models.Report.findOne({
                include: [
                    {
                        model: models.SchedulerTask,
                    },
                ],
                where: {
                    report_name: report_name.report_name
                }
            })
            if (report) {
                try {
                    var SchedulerLogs = await models.SchedulerTaskLog.findAll({
                        where: {
                            SchedulerJobId: report.SchedulerTask.id
                        }
                    })
                    var outputlogs=[]
                    for (var logItem of SchedulerLogs) {
                        var log={}
                        log.task_status=logItem.task_status;
                        log.task_executed=moment(logItem.task_executed).toString();
                        outputlogs.push(log);
                    }
                    var response = {
                        success: 1, message: "found", SchedulerLogs:outputlogs}
                    return response;
                   
                }
                catch (ex) {
                    var response = { success: 0, message: ex }
                    return response;
                }

            }
            else {
                var response = { success: 0, message: "Report Not Exist" }
                return response;
            }
        }
        catch (ex) {
            var response = { success: 0, message: ex }
            return response;
        }
    },
    JobsByUser: async function(userName,page,pageSize){
        if(!page){
            page=0;
        }
        if(!pageSize){
            pageSize=2;
        }
        var offset = page * pageSize;
        var limit = offset + pageSize
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
                    },
                ],
                where: {
                    userid:userName,     
                },
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
                var response = { message: "Reports Not Exist For This User" }
                return response;
            }
        }
        catch (ex) {
            var response = { success: 0, message: ex }
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user',
                error: ex,
              });
            return response;
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
                    },
                ],
            })
            if ( exist_report ) {
                return schedulerDTO(exist_report);
            }
            else {
                var response = { message: "Reports Not Exist" }
                return response;
            }
        }
        catch (ex) {
            var response = { success: 0, message: ex }
            logger.log({
                level: 'error',
                message: 'error while fetching reports for user',
                error: ex,
              });
            return response;
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
            var response = { success: 0, message: ex }
            logger.log({
                level: 'error',
                message: 'error while fetching reports count for user',
                error: ex,
              });
            return response;
        }


    },
}

module.exports = job;
