

var models = require('../database/models/index');
var db = require('../database/models/index');

var shedularlog= {
    jobexecuted: async function(params) {
        const transaction = await db.sequelize.transaction();
        try {
        //create report object
        let report = await models.Report.create({
            connection_name: params.report.connection_name,
            mail_body : params.report.mail_body,
            subject: params.report.subject,
            report_name: params.report.report_name ,
            source_id: params.report.source_id  
            },{transaction});

        let report_line_item = await models.ReportLineItem.create({
            reportId: report.id,
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
            reportId: report.id,
            channel:params.assign_report.channel,
            email_list: params.assign_report.email_list,
            condition: params.assign_report.condition,
            },{transaction}) 
            
        let shedualar_obj= await models.SchedulerTask.create({
            reportId: report.id,
            cron_exp: params.cron_exp,
            active: true,
            timezone: params.schedule.timezone
        },{transaction})    

        await transaction.commit();
 
        return report;

        }
        catch (ex) {
            await transaction.rollback();
            res.json({ success: 0, message: ex });
          }

    }
}

module.exports = shedularlog;