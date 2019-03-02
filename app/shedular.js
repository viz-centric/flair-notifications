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
    shedulJob:  function (reports_data) {

        let cron_expression = {
            start: moment(reports_data.report_shedular_obj.start_date).toDate(),
            end: moment(reports_data.report_shedular_obj.end_date).toDate(),
            rule: reports_data['report_shedular_obj']['cron_exp']
        };

        var job = scheduler.scheduleJob(cron_expression, function (reports_data) {
            // console.log("started");
            try {
                loadDataAndSendMail(reports_data);
            }
            catch (ex) {
                console.log(ex);
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: ex,
                });
            }


        }.bind(null, reports_data));
        return job;

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
        var to_mail_list = reports_data['report_assign_obj']['email_list']
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
