var scheduler = require('node-schedule');
var sendmailtool = require('./send-mail')
var models = require('./database/models/index');
var pie_chart = require('./chart/pie');
var pie_config = require('./chart/config');
var line_chart = require('./chart/linechart/line');
var line_config = require('./chart/linechart/line_config');
var wkhtmltoimage = require('wkhtmltoimage');
var grpc_client = require('./grpc/client');
var moment = require('moment');

var AppConfig = require('./load_config');
var image_dir = AppConfig.imageFolder;

var retryDelay = 3000 //in miliseconds


var shedular = {
    shedulJob:  function (report_name,cron_exp,start_date,end_date) {
        if(start_date && end_date ){
            var cron_expression = {
                start: moment(start_date).toDate(),
                end: moment(end_date).toDate(),
                rule: cron_exp
            };
        }
        else{
            var cron_expression =cron_exp;
        }
        
        var job_name="JOB_"+report_name
        var job = scheduler.scheduleJob(job_name ,cron_expression, function (report_name) {
            console.log(report_name+" execution started")
            try {
                models.Report.find({
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
                            where: {
                                active:true
                            },
                        },
            
                    ],
                    where: {
                        report_name:report_name
                    }
                }).then(function(report){
                        var reports_data={
                            report_obj:report,
                            report_line_obj :report.reportline,
                            report_assign_obj:report.AssignReport,
                            report_shedular_obj:report.SchedulerTask
                        }
                        loadDataAndSendMail(reports_data);
                    }).catch(function(err){
                        console.log('Oops! something went wrong, : ', err);
                    });
                   
            }
            catch (ex) {
                console.log(ex);
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: ex,
                });
            }


        }.bind(null, report_name));
        return job;

    },
    cancleJob: function(jobName){
        all_jobs=scheduler.scheduledJobs
        if (jobName in all_jobs) {
            all_jobs[jobName].cancel()
            return true
        }
        else{
            return false;
        }
        

    },
    reShedulJob: function(jobName,start_date,end_date,cron_exp){
        let cron_expression = {
            start: moment(start_date).toDate(),
            end: moment(end_date).toDate(),
            rule: cron_exp
        };
        all_jobs=scheduler.scheduledJobs;
        result=all_jobs[jobName].reschedule(cron_expression);
        return result;
        

    }
}

function loadDataAndSendMail(reports_data) {
    let query = {
        queryId: "1",
        userId: "manohar",
        sourceId: reports_data.report_obj.source_id,
        source: reports_data.report_line_obj.table,
        fields: reports_data.report_line_obj.fields,
        groupBy: [],
        limit: reports_data.report_line_obj.limit
    }
    var grpcRetryCount=0;
    function loadDataFromGrpc(query){
        grpcRetryCount+=1;
        var data_call = grpc_client.getRecords(query);
        data_call.then(function (response) {
        var json_res = JSON.parse(response.data);

        //render html chart
        if (reports_data.report_line_obj.viz_type == "pie") {
            var html_body = pie_chart({
                data: json_res.data,
                containerId: 'pie',
                tooltipId: 'tooltip',
                config: pie_config,
                dimension: [reports_data.report_line_obj.fields[0]],
                measure: [reports_data.report_line_obj.fields[1]]
            })
        }
        else if (reports_data.report_line_obj.viz_type == "line") {
            var html_body = line_chart({
                data: json_res.data,
                containerId: 'pie',
                tooltipId: 'tooltip',
                config: line_config,
                dimension: [reports_data.report_line_obj.fields[0]],
                measure: [reports_data.report_line_obj.fields[1]]
            })
        }

        var imagefilename = reports_data['report_obj']['report_name'] + '_' + new Date().getTime() + '.jpg';

        wkhtmltoimage.generate(html_body, { output: image_dir + imagefilename });
        var to_mail_list=[];
        for(user of reports_data['report_assign_obj']['email_list']){
            to_mail_list.push(user['user_email'])
          }
        var mail_body = reports_data['report_obj']['mail_body']
        var report_title = reports_data['report_obj']['title_name']
        var subject = reports_data['report_obj']['subject']
        var mailRetryCount=0;
        function sendMail(subject, to_mail_list, mail_body, report_title, imagefilename){
            mailRetryCount+=1;
            sendmailtool.sendMail(subject, to_mail_list, mail_body, report_title, imagefilename).then(function (response) {

                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: "success",
                });
            },
                function (error) {
                    console.log(error);
                    if (mailRetryCount < 2){
                        console.log("send mail retrying");
                        setTimeout(() => sendMail(subject, to_mail_list, mail_body, report_title, imagefilename),
                         retryDelay);  
                    }
                    else{
                        let shedularlog = models.SchedulerTaskLog.create({
                            SchedulerJobId: reports_data['report_shedular_obj']['id'],
                            task_executed: new Date(Date.now()).toISOString(),
                            task_status: "mail "+error,
                        });
                    }
                    
                });

        }
        sendMail(subject, to_mail_list, mail_body, report_title, imagefilename);
       


    }, function (err) {
        console.log(err);
        if (grpcRetryCount < 2){
            console.log("grpc retrying");
            setTimeout(() => loadDataFromGrpc(query), retryDelay);  
        }
        else{
            let shedularlog = models.SchedulerTaskLog.create({
                SchedulerJobId: reports_data['report_shedular_obj']['id'],
                task_executed: new Date(Date.now()).toISOString(),
                task_status: "grpc err:"+err,
            });
        }
        
    })

    }

    loadDataFromGrpc(query);
    
}

module.exports = shedular;
