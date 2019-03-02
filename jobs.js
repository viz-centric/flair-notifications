
var models = require('./database/models/index');
var db = require('./database/models/index');
var shedular= require('./shedular');
var moment = require('moment');

var job= {
    createJob: async function(params) {

        exist_report = await models.Report.find({
                        where: {
                            report_name: params.report.report_name
                        }
           })
        if(!exist_report){
            const transaction = await db.sequelize.transaction();
            try {
            //create report object
            let report = await models.Report.create({
                connection_name: params.report.connection_name,
                mail_body : params.report.mail_body,
                subject: params.report.subject,
                report_name: params.report.report_name ,
                source_id: params.report.source_id,
                title_name: params.report.title_name
                },{transaction});

            let report_line_item = await models.ReportLineItem.create({
                ReportId: report.id,
                viz_type: params.report_line_item.visualization,
                query_name: params.report_line_item.query_name,
                fields: params.report_line_item.fields,
                group_by: params.report_line_item.group_by,
                order_by: params.report_line_item.order_by,
                where: params.report_line_item.where,
                limit: params.report_line_item.limit,
                table: params.report_line_item.table
                },{transaction})

            let assign_report_obj= await models.AssignReport.create({
                ReportId: report.id,
                channel:params.assign_report.channel,
                email_list: params.assign_report.email_list,
                condition: params.assign_report.condition,
                },{transaction})

            let shedualar_obj= await models.SchedulerTask.create({
                ReportId: report.id,
                cron_exp: params.cron_exp,
                active: true,
                timezone: params.schedule.timezone,
                start_date:moment(params.schedule.start_date),
                end_date:moment(params.schedule.end_date)
            },{transaction})

            await transaction.commit();
            var reports_data={
                report_obj:report,
                report_line_obj :report_line_item,
                report_assign_obj:assign_report_obj,
                report_shedular_obj:shedualar_obj
            }
            job=await shedular.shedulJob(reports_data)

            var response={success: 1,message:"created",report_name:report.report_name,
                job_id: shedualar_obj.id,next_run:job.nextInvocation()}
            return response;

            }
            catch (ex) {
                await transaction.rollback();
                res.json({ success: 0, message: ex });
              }

        }
        else{
            var response={success: 0, message: "report with this name already exit"}
            return response;
        }

    }
}

module.exports = job;
