var sendmailtool = require('./send-mail');
var sendNotification = require('./send-team-notification');
var util = require('./util');

var models = require('./database/models/index');
const db = require('./database/models/index');
var grpc_client = require('./grpc/client');
var charts = require('./chart/generate-charts');
var logger = require('./logger');
var imageProcessor = require('./services/image-processor.service');
const queryService = require('./services/query-service');
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

    'Map': {
        generateChart: function (report_obj, data) {
            return charts.mapChart(report_obj.report_line_obj.visualizationid, data);
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
            return charts.boxplotChart(report_obj.report_line_obj.visualizationid, data);
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

exports.loadDataAndSendNotification = function loadDataAndSendNotification(reports_data, thresholdAlertEmail) {
    let query = reports_data.report_line_obj.query;
    var grpcRetryCount = 0;
    function loadDataFromGrpc(query) {
        grpcRetryCount += 1;
        const rawQuery = queryService.preProcessQuery(query);
        var data_call = grpc_client.getRecords(rawQuery);
        data_call.then(async function (response) {
            var json_res = JSON.parse(response.data);
            if (json_res && json_res.data.length > 0) {
                reports_data.report_line_obj.visualizationid = thresholdAlertEmail ? reports_data.report_line_obj.visualizationid.split(":")[1] : reports_data.report_line_obj.visualizationid
                //render html chart
                generate_chart = chartMap[reports_data.report_line_obj.viz_type].generateChart(reports_data, json_res.data);

                generate_chart.then(function (response) {
                    var imagefilename = thresholdAlertEmail ? 'threshold_alert_chart_' + reports_data['report_obj']['report_name'] + '.png' : reports_data['report_obj']['report_name'] + '.png';
                    var toMailList = [];

                    //get communication lists
                    var communicationList = reports_data['report_assign_obj']['communication_list'];

                    //getting email communication lists
                    var emailCommunicationList = communicationList.email;
                    var webhookURL = communicationList.teams;
                    for (user of emailCommunicationList) {
                        toMailList.push(user['user_email'])
                    }
                    var mailBody = reports_data['report_obj']['mail_body']
                    var reportTitle = reports_data['report_obj']['title_name']
                    var subject = thresholdAlertEmail ? "Threshold Alert " + reports_data['report_obj']['subject'] : reports_data['report_obj']['subject'];
                    var buildUrl = reports_data['report_obj']['build_url']
                    var shareLink = reports_data['report_obj']['share_link']
                    var dashboard = reports_data['report_obj']['dashboard_name']
                    var viewName = reports_data['report_obj']['view_name']
                    var mailRetryCount = 0;
                    var viewDataLink = "", flairInsightsLink = "";
                    function sendReport(subject, toMailList, mailBody, reportTitle, imagefilename) {
                        mailRetryCount += 1;
                        var channels = reports_data['report_assign_obj']['channel'];

                        var isTeamMessage = channels.indexOf("Teams") != -1 ? true : false;
                        imageProcessor.saveImageConvertToBase64(imagefilename, response, isTeamMessage).then(async function (bytes) {

                            if (channels.indexOf('Email') >= 0) {

                                var ImageBase64 = bytes.filter(function (val) { return val["key"] == "Email" })

                                const transaction = await db.sequelize.transaction();
                                try {
                                    const shedularlog = await models.SchedulerTaskLog.create({
                                        SchedulerJobId: reports_data['report_shedular_obj']['id'],
                                        task_executed: new Date(Date.now()).toISOString(),
                                        task_status: "success",
                                        thresholdMet: thresholdAlertEmail,
                                        notificationSent: true,
                                        channel: "Email"
                                    }, { transaction });

                                    const schedulerTaskMeta = await models.SchedulerTaskMeta.create({
                                        SchedulerTaskLogId: shedularlog.id,
                                        rawQuery: rawQuery,
                                    }, { transaction });
                                    await transaction.commit();
                                    viewDataLink = util.getViewDataURL(shareLink, schedulerTaskMeta.id);
                                    flairInsightsLink = util.getGlairInsightsLink(shareLink, reports_data.report_line_obj.visualizationid)
                                    var emailData = {
                                        subject: subject,
                                        description: mailBody,
                                        reportTitle: reportTitle,
                                        buildUrl: buildUrl,
                                        shareLink: shareLink,
                                        base64: ImageBase64[0].encodedUrl,
                                        tableData: json_res.data,
                                        toMailList: toMailList,
                                        viewDataLink: viewDataLink,
                                        flairInsightsLink: flairInsightsLink,
                                        dashboard: dashboard,
                                        viewName: viewName,
                                        imagefilename: imagefilename,
                                        chartResponse: response,
                                        visualizationType: reports_data.report_line_obj.viz_type
                                    }


                                } catch (error) {
                                    await transaction.rollback();
                                    logger.log({
                                        level: 'error',
                                        message: 'error while saving scheduler log',
                                        errMsg: error,
                                    });
                                }

                                sendmailtool.sendMail(emailData).then(async function (success) {

                                },
                                    function (error) {
                                        transaction.rollback();
                                        logger.log({
                                            level: 'error',
                                            message: 'error while sending mail' + thresholdAlertEmail ? ' for threshold alert' : '',
                                            errMsg: error,
                                        });
                                        if (mailRetryCount < 2) {
                                            setTimeout(() => sendReport(subject, toMailList, mailBody, reportTitle, imagefilename),
                                                retryDelay);
                                        }
                                        else {
                                            let shedularlog = models.SchedulerTaskLog.create({
                                                SchedulerJobId: reports_data['report_shedular_obj']['id'],
                                                task_executed: new Date(Date.now()).toISOString(),
                                                task_status: "mail " + error,
                                                thresholdMet: thresholdAlertEmail,
                                                notificationSent: false,
                                                channel: "Email"
                                            });
                                        }

                                    });
                            }
                            if (channels.indexOf('Teams') >= 0) {
                                var ImageBase64 = bytes.filter(function (val) { return val["key"] == "Teams" })

                                var teamData = {
                                    dashboard: dashboard,
                                    view: viewName,
                                    description: mailBody,
                                    reportTitle: reportTitle,
                                    buildUrl: buildUrl,
                                    shareLink: shareLink,
                                    base64: ImageBase64[0].encodedUrl,
                                    tableData: json_res.data,
                                    webhookURL: webhookURL,
                                    visualizationId: reports_data.report_line_obj.visualizationid,
                                    rawQuery
                                }
                                sendNotification.sendTeamNotification(teamData, reports_data);
                            }

                        }).catch(function (error) {
                            logger.log({
                                level: 'error',
                                message: 'error while generating image' + thresholdAlertEmail ? ' for threshold alert' : '',
                                errMsg: error,
                            });
                            let shedularlog = models.SchedulerTaskLog.create({
                                SchedulerJobId: reports_data['report_shedular_obj']['id'],
                                task_executed: new Date(Date.now()).toISOString(),
                                task_status: "mail " + error,
                                thresholdMet: thresholdAlertEmail,
                                notificationSent: false,
                                channel: ''
                            });
                        });
                    }

                    sendReport(subject, toMailList, mailBody, reportTitle, imagefilename);

                }, function (err) {
                    logger.log({
                        level: 'error',
                        message: thresholdAlertEmail ? 'error while generating chart for threshold alert' + err : 'error while generating chart' + err,
                        errMsg: err,
                    });
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reports_data['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: thresholdAlertEmail ? 'error while generating chart for threshold alert' + err : 'error while generating chart' + err,
                        thresholdMet: thresholdAlertEmail,
                        notificationSent: false,
                        channel: ''
                    });
                });
            } else {
                logger.log({
                    level: 'error',
                    message: "no data found",
                    errMsg: "no data found",
                });
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: "no data found",
                    thresholdMet: thresholdAlertEmail,
                    notificationSent: false,
                    channel: ''
                });
            }
        }, function (err) {
            logger.log({
                level: 'error',
                message: thresholdAlertEmail ? 'error while fetching records from GRPC for threshold alert' + err : 'error while fetching records from GRPC' + err,
                errMsg: err,
            });
            if (grpcRetryCount < 2) {
                setTimeout(() => loadDataFromGrpc(query), retryDelay);
            }
            else {
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: thresholdAlertEmail ? 'error while fetching records from GRPC for threshold alert' + err : 'error while fetching records from GRPC' + err,
                    thresholdMet: thresholdAlertEmail,
                    notificationSent: false,
                    channel: '',
                });
            }

        })

    }

    loadDataFromGrpc(query);

}