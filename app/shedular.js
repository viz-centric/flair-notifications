var scheduler = require('node-schedule');
var sendmailtool = require('./send-mail')
var models = require('./database/models/index');
var wkhtmltoimage = require('wkhtmltoimage');
var grpc_client = require('./grpc/client');
var moment = require('moment');
var charts=require('./chart/generate-charts');
var logger=require('./logger');

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
            logger.log({
                level: 'info',
                message: 'report execution started ',
                report_name:report_name,
              });
            try {
                models.Report.findOne({
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
                        logger.log({
                            level: 'error',
                            message: 'error while fetching reports data for execution',
                            errMsg:err,
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
    let query=reports_data.report_line_obj.query;

    var grpcRetryCount=0;
    function loadDataFromGrpc(query){
        grpcRetryCount+=1;
        var data_call = grpc_client.getRecords(query);
        data_call.then(function (response) {
        var json_res = JSON.parse(response.data);
        var config={
            dimension: reports_data.report_line_obj.dimension,
            measure: reports_data.report_line_obj.measure,
        }
        //render html chart
        if (reports_data.report_line_obj.viz_type == "Pie Chart") {
            chart_call= charts.pieChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Line Chart") {
            chart_call= charts.lineChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Clustered Vertical Bar Chart") {
            chart_call= charts.clusteredverticalBarChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Clustered Horizontal Bar Chart") {
            chart_call= charts.clusteredhorizontalBarChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Heat Map") {
            chart_call= charts.heatmapChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Stacked Vertical Bar Chart") {
            chart_call= charts.stackedverticalBarChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Stacked Horizontal Bar Chart") {
            chart_call= charts.stackedhorizontalBarChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Combo Chart") {
            chart_call= charts.comboChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Tree Map") {
            chart_call= charts.treemapChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Info graphic") {
            chart_call= charts.infographicsChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Box Plot") {
            chart_call= charts.boxplotChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Bullet Chart") {
            chart_call= charts.bulletChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Sankey") {
            chart_call= charts.sankeyChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Table") {
            chart_call= charts.tableChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Pivot Table") {
            chart_call= charts.pivottableChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Doughnut Chart") {
            chart_call= charts.doughnutChart(config,json_res.data);
        } 

        else if (reports_data.report_line_obj.viz_type == "KPI") {
            chart_call= charts.kpiChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Scatter plot") {
            chart_call= charts.scatterChart(config,json_res.data);
        }
        else if (reports_data.report_line_obj.viz_type == "Gauge plot") {
            chart_call= charts.gaugeChart(config,json_res.data);
        }

        chart_call.then(function (response) {
                var imagefilename = reports_data['report_obj']['report_name'] + '.jpg';

                wkhtmltoimage.generate(response, { output: image_dir + imagefilename });
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
            },function(err){
                logger.log({
                    level: 'error',
                    message: 'error while generating chart',
                    errMsg:err,
                  });
            })


    }, function (err) {
        logger.log({
            level: 'error',
            message: 'error while fetching records data from GRPC ',
            errMsg:err,
          });
        if (grpcRetryCount < 2){
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
