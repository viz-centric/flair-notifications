var sendmailtool = require('./email.service');
var models = require('../database/models/index');
var grpc_client = require('../grpc/client');
var charts = require('../chart/generate-charts');
var logger = require('../logger');
var imageProcessor = require('./image-processor.service');
const retryDelay = 3000 //in miliseconds

const chartMap = {
    'Clustered Vertical Bar Chart': {
        generateChart: function (report_obj, data) {
            return charts.clusteredverticalBarChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Clustered Horizontal Bar Chart': {
        generateChart: function (report_obj, data) {
            return charts.clusteredhorizontalBarChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Stacked Vertical Bar Chart': {
        generateChart: function (report_obj, data) {
            return charts.stackedverticalBarChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Stacked Horizontal Bar Chart': {
        generateChart: function (report_obj, data) {
            return charts.stackedhorizontalBarChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Line Chart': {
        generateChart: function (report_obj, data) {
            return charts.lineChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Combo Chart': {
        generateChart: function (report_obj, data) {
            return charts.comboChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Scatter plot': {
        generateChart: function (report_obj, data) {
            return charts.scatterChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pie Chart': {
        generateChart: function (report_obj, data) {
            return charts.pieChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Doughnut Chart': {
        generateChart: function (report_obj, data) {
            return charts.doughnutChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Gauge plot': {
        generateChart: function (report_obj, data) {
            var config = {
                dimension: report_obj.report_line_obj.dimension,
                measure: report_obj.report_line_obj.measure,
            }
            return charts.gaugeChart(config, data);
        }
    },

    'Table': {
        generateChart: function (report_obj, data) {
            return charts.tableChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pivot Table': {
        generateChart: function (report_obj, data) {
            return charts.pivottableChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'KPI': {
        generateChart: function (report_obj, data) {
            return charts.kpiChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Info-graphic': {
        generateChart: function (report_obj, data) {
            return charts.infographicsChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Tree Map': {
        generateChart: function (report_obj, data) {
            return charts.treemapChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Heat Map': {
        generateChart: function (report_obj, data) {
            return charts.heatmapChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Box Plot': {
        generateChart: function (report_obj, data) {
            var config = {
                dimension: report_obj.report_line_obj.dimension,
                measure: report_obj.report_line_obj.measure,
            }
            return charts.boxplotChart(config, data);
        }
    },

    'Text Object': {
        generateChart: function (report_obj, data) {
            return charts.textObjectChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Bullet Chart': {
        generateChart: function (report_obj, data) {
            return charts.bulletChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Chord Diagram': {
        generateChart: function (report_obj, data) {
            return charts.chorddiagramChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Sankey': {
        generateChart: function (report_obj, data) {
            return charts.sankeyChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pie Grid': {
        generateChart: function (report_obj, data) {
            return charts.piegridChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Number Grid': {
        generateChart: function (report_obj, data) {
            return charts.numbergridChart(report_obj.report_line_obj.visualizationid, data);
        }
    }
};

exports.loadDataAndSendMail = function loadDataAndSendMail(reports_data,thresholdAlertEmail) {
    let query = reports_data.report_line_obj.query;
    var grpcRetryCount = 0;
    function loadDataFromGrpc(query) {
        grpcRetryCount += 1;
        var data_call = grpc_client.getRecords(query);
        data_call.then(function (response) {
            var json_res = JSON.parse(response.data);
            reports_data.report_line_obj.visualizationid=thresholdAlertEmail?reports_data.report_line_obj.visualizationid.split(":")[1]:reports_data.report_line_obj.visualizationid
            //render html chart
            generate_chart = chartMap[reports_data.report_line_obj.viz_type].generateChart(reports_data, json_res.data);

            generate_chart.then(function (response) {
                var imagefilename =thresholdAlertEmail?'threshold_alert_chart_'+reports_data['report_obj']['report_name'] + '.png':reports_data['report_obj']['report_name'] + '.png';
                var to_mail_list = [];
                for (user of reports_data['report_assign_obj']['email_list']) {
                    to_mail_list.push(user['user_email'])
                }
                var mail_body = reports_data['report_obj']['mail_body']
                var report_title = reports_data['report_obj']['title_name']
                var subject = thresholdAlertEmail?"Threshold Alert "+reports_data['report_obj']['subject']:reports_data['report_obj']['subject'];
                var build_url = reports_data['report_obj']['build_url']
                var share_link = reports_data['report_obj']['share_link']
                var dash_board = reports_data['report_obj']['dashboard_name']
                var mailRetryCount = 0;
                function sendMail(subject, to_mail_list, mail_body, report_title,imagefilename) {
                    mailRetryCount += 1;
                    imageProcessor.saveImageConvertToBase64(imagefilename,response).then(function (bytes) {
                        sendmailtool.sendMail(subject, to_mail_list, mail_body, report_title, share_link, build_url, dash_board, bytes,imagefilename).then(function (success) {
                            try {
                                let shedularlog = models.SchedulerTaskLog.create({
                                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                                    task_executed: new Date(Date.now()).toISOString(),
                                    task_status: "success",
                                });
                            } catch (error) {
                                logger.log({
                                    level: 'error',
                                    message: 'error while saving scheduler log',
                                });
                            }
    
                        },
                        function (error) {
                            logger.log({
                                level: 'error',
                                message: 'error while sending mail'+thresholdAlertEmail?' for threshold alert':'',
                                errMsg: error,
                            });
                            if (mailRetryCount < 2) {
                                setTimeout(() => sendMail(subject, to_mail_list, mail_body, report_title,imagefilename),
                                    retryDelay);
                            }
                            else {
                                let shedularlog = models.SchedulerTaskLog.create({
                                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                                    task_executed: new Date(Date.now()).toISOString(),
                                    task_status: "mail " + error,
                                });
                            }
    
                        });
                    }).catch(function (error) {
                        logger.log({
                            level: 'error',
                            message: 'error while generating image'+thresholdAlertEmail?' for threshold alert':'',
                            errMsg: err,
                        });
                        let shedularlog = models.SchedulerTaskLog.create({
                            SchedulerJobId: reports_data['report_shedular_obj']['id'],
                            task_executed: new Date(Date.now()).toISOString(),
                            task_status: "mail " + error,
                        });
                    });
                }
                sendMail(subject, to_mail_list, mail_body, report_title,imagefilename);
            }, function (err) {
                logger.log({
                    level: 'error',
                    message: thresholdAlertEmail?'error while generating chart for threshold alert'+err:'error while generating chart'+err,
                    errMsg: err,
                });
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: thresholdAlertEmail?'error while generating chart for threshold alert'+err:'error while generating chart'+err
                });
            });
        }, function (err) {
            logger.log({
                level: 'error',
                message: thresholdAlertEmail?'error while fetching records from GRPC for threshold alert'+err:'error while fetching records from GRPC'+err,
                errMsg: err,
            });
            if (grpcRetryCount < 2) {
                setTimeout(() => loadDataFromGrpc(query), retryDelay);
            }
            else {
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: thresholdAlertEmail?'error while fetching records from GRPC for threshold alert'+err:'error while fetching records from GRPC'+err,
                });
            }

        })

    }

    loadDataFromGrpc(query);

}

