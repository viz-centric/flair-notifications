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
let channelStatus = [];
const chartMap = {
    'Clustered Vertical Bar Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.clusteredverticalBarChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Clustered Horizontal Bar Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.clusteredhorizontalBarChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Stacked Vertical Bar Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.stackedverticalBarChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Stacked Horizontal Bar Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.stackedhorizontalBarChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Line Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.lineChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Combo Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.comboChart(report_obj.report_line_obj.visualizationid, data, report_obj, option);
        }
    },

    'Scatter plot': {
        generateChart: function (report_obj, data, option) {
            return charts.scatterChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pie Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.pieChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Doughnut Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.doughnutChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Gauge plot': {
        generateChart: function (report_obj, data, option) {
            return charts.gaugeChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Table': {
        generateChart: function (report_obj, data, option) {
            return charts.tableChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pivot Table': {
        generateChart: function (report_obj, data, option) {
            return charts.pivottableChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'KPI': {
        generateChart: function (report_obj, data, option) {
            return charts.kpiChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Info-graphic': {
        generateChart: function (report_obj, data, option) {
            return charts.infographicsChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Map': {
        generateChart: function (report_obj, data, option) {
            return charts.mapChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Tree Map': {
        generateChart: function (report_obj, data, option) {
            return charts.treemapChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Heat Map': {
        generateChart: function (report_obj, data, option) {
            return charts.heatmapChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Box Plot': {
        generateChart: function (report_obj, data, option) {
            return charts.boxplotChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Text Object': {
        generateChart: function (report_obj, data, option) {
            return charts.textObjectChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Bullet Chart': {
        generateChart: function (report_obj, data, option) {
            return charts.bulletChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Chord Diagram': {
        generateChart: function (report_obj, data, option) {
            return charts.chorddiagramChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Sankey': {
        generateChart: function (report_obj, data, option) {
            return charts.sankeyChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Pie Grid': {
        generateChart: function (report_obj, data, option) {
            return charts.piegridChart(report_obj.report_line_obj.visualizationid, data);
        }
    },

    'Number Grid': {
        generateChart: function (report_obj, data, option) {
            return charts.numbergridChart(report_obj.report_line_obj.visualizationid, data);
        }
    }
};

const updateSchedulerTaskLog = async function (data, shedularlog, channel) {

    var log = await models.SchedulerTaskLog.findOne({
        where: {
            id: shedularlog.id
        }
    });

    const transaction = await db.sequelize.transaction();
    try {

        var channelData = JSON.parse(log.channel);
        channelData = channelData.map(function (val) {
            if (val.channel === channel) {
                val.notificationSent = data.success == 1 ? true : false
                val.status = data.message
            }
            return val;
        })

        await models.SchedulerTaskLog.update({
            channel: JSON.stringify(channelData),
        }, {
            where: {
                id: shedularlog.id
            }
        }, { transaction });

        await transaction.commit();

    } catch (error) {
        await transaction.rollback();
        logger.error({
            level: 'error',
            message: 'error occured while updating scheduler log',
            errMsg: error,
        });
    }
}

exports.loadDataAndSendNotification = function loadDataAndSendNotification(reports_data, options) {
    let query = reports_data.report_line_obj.query;
    const thresholdAlertEmail = reports_data.report_obj.thresholdAlert;

    var grpcRetryCount = 0;

    function loadDataFromGrpc(query) {
        grpcRetryCount += 1;

        const rawQuery = queryService.preProcessQuery(query);

        console.debug('Executing query', rawQuery);

        var data_call = grpc_client.getRecords(rawQuery, options);

        data_call.then(async function (response) {

            var channels = reports_data['report_assign_obj']['channel'];
            var json_res = JSON.parse(response.data);

            if (json_res && json_res.data.length > 0) {
                channelStatus = [];
                for (let index = 0; index < channels.length; index++) {
                    channelStatus.push(
                        {
                            channel: channels[index],
                            notificationSent: true,
                            status: "-"
                        }
                    )
                }

                var vizID = reports_data.report_line_obj.visualizationid;
                reports_data.report_line_obj.visualizationid = thresholdAlertEmail ? reports_data.report_line_obj.visualizationid.split(":")[1] : reports_data.report_line_obj.visualizationid
                //render html chart
                generate_chart = chartMap[reports_data.report_line_obj.viz_type].generateChart(reports_data, json_res.data, options);

                generate_chart.then(async function (response) {
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
                    var viewDataLink = "", flairInsightsLink = "",viewWidgetLink="";

                    flairInsightsLink = util.getFlairInsightsLink(shareLink, vizID, thresholdAlertEmail);

                    let shedularlog = null, schedulerTaskMeta = null;

                    const transaction = await db.sequelize.transaction();
                    try {
                        shedularlog = await models.SchedulerTaskLog.create({
                            SchedulerJobId: reports_data['report_shedular_obj']['id'],
                            task_executed: new Date(Date.now()).toISOString(),
                            task_status: "success",
                            thresholdMet: thresholdAlertEmail,
                            notificationSent: true,
                            channel: JSON.stringify(channelStatus),
                            enableTicketCreation: true
                        }, { transaction });

                        schedulerTaskMeta = await models.SchedulerTaskMeta.create({
                            SchedulerTaskLogId: shedularlog.id,
                            rawQuery: rawQuery
                        }, { transaction });
                        await transaction.commit();

                        viewDataLink = util.getViewDataURL(shareLink, schedulerTaskMeta.id,reports_data['report_obj']['view_id'],reports_data.report_line_obj.visualizationid);
                        viewWidgetLink = util.getViewWidgetLink(shareLink, schedulerTaskMeta.id,reports_data['report_obj']['view_id'],reports_data.report_line_obj.visualizationid);

                        const updateTransaction = await db.sequelize.transaction();
                        await models.SchedulerTaskMeta.update({
                            viewData: viewDataLink,
                            viewWidget : viewWidgetLink
                        }, {
                            where: {
                                id: schedulerTaskMeta.id
                            }
                        }, { updateTransaction });

                        await updateTransaction.commit();
                    } catch (error) {
                        await transaction.rollback();
                        logger.error({
                            level: 'error',
                            message: 'error occured while saving scheduler log',
                            errMsg: error,
                        });
                    }

                    async function sendReport(subject, toMailList, mailBody, reportTitle) {
                        mailRetryCount += 1;
                        var channelList = util.channelList();
                        if (util.checkChannel(channels, channelList.email)) {
                            var d = new Date();
                            var imagefilename = thresholdAlertEmail ? 'threshold_alert_chart_' + reports_data['report_obj']['report_name'] + "_" + d.getTime() + "_" + channelList.email + '.png' : reports_data['report_obj']['report_name'] + "_" + d.getTime() + "_" + channelList.email + '.png';
                            imageProcessor.saveImageConvertToBase64ForEmail(imagefilename, response).then(async function (bytes) {

                                var emailData = {
                                    subject: subject,
                                    description: mailBody,
                                    reportTitle: reportTitle,
                                    buildUrl: buildUrl,
                                    shareLink: shareLink,
                                    base64: bytes,
                                    tableData: json_res.data,
                                    toMailList: toMailList,
                                    viewDataLink: viewDataLink,
                                    viewWidgetLink: viewWidgetLink,
                                    flairInsightsLink: flairInsightsLink,
                                    dashboard: dashboard,
                                    viewName: viewName,
                                    imagefilename: imagefilename,
                                    chartResponse: response,
                                    visualizationType: reports_data.report_line_obj.viz_type,
                                    measure: reports_data.report_line_obj.measure,
                                    dimension: reports_data.report_line_obj.dimension
                                }

                                sendmailtool.sendMail(emailData).then(async function (data) {
                                    await updateSchedulerTaskLog(data, shedularlog, channelList.email);
                                },
                                    async function (error) {
                                        await updateSchedulerTaskLog(error, shedularlog, channelList.email);
                                        logger.error({
                                            level: 'error',
                                            message: 'error while sending mail' + thresholdAlertEmail ? ' for threshold alert' : 'error while sending mail',
                                            errMsg: error,
                                        });
                                        if (mailRetryCount < 2) {
                                            channels = [channelList.email];
                                            setTimeout(() => sendReport(subject, toMailList, mailBody, reportTitle, imagefilename),
                                                retryDelay);
                                        }
                                    });

                            }).catch(async function (error) {
                                logger.error({
                                    level: 'error',
                                    message: thresholdAlertEmail ? 'error while generating image for threshold alert' : 'error while generating image',
                                    errMsg: error,
                                });

                                await updateSchedulerTaskLog(error, shedularlog, channelList.email);

                            });
                        }
                        if (util.checkChannel(channels, channelList.team)) {
                            var d = new Date();
                            var imagefilename = thresholdAlertEmail ? 'threshold_alert_chart_' + reports_data['report_obj']['report_name'] + "_" + d.getTime() + "_" + channelList.team + '.png' : reports_data['report_obj']['report_name'] + "_" + d.getTime() + "_" + channelList.team + '.png';
                            imageProcessor.saveImageConvertToBase64ForTeam(imagefilename, response).then(async function (bytes) {

                                var teamData = {
                                    dashboard: dashboard,
                                    view: viewName,
                                    description: mailBody,
                                    reportTitle: reportTitle,
                                    buildUrl: buildUrl,
                                    shareLink: shareLink,
                                    base64: bytes.split("|")[0],
                                    compressText: bytes.split("|")[1],
                                    tableData: json_res.data,
                                    webhookURL: webhookURL,
                                    visualizationId: vizID,
                                    isThresholdReport: thresholdAlertEmail,
                                    schedulerTaskMeta: schedulerTaskMeta,
                                    viewDataLink: viewDataLink,
                                    viewWidgetLink: viewWidgetLink,
                                    flairInsightsLink: flairInsightsLink,
                                    visualizationType: reports_data.report_line_obj.viz_type,
                                    chartrRsponse: response,
                                    rawQuery,
                                    measure: reports_data.report_line_obj.measure,
                                    dimension: reports_data.report_line_obj.dimension
                                }

                                sendNotification.sendTeamNotification(teamData, reports_data).then(async function (data) {
                                    await updateSchedulerTaskLog(data, shedularlog, channelList.team);
                                },
                                    async function (error) {
                                        await updateSchedulerTaskLog(error, shedularlog, channelList.team);
                                        logger.error({
                                            level: 'error',
                                            message: 'error while sending mail' + thresholdAlertEmail ? ' for threshold alert' : 'error while sending mail',
                                            errMsg: error,
                                        });
                                        if (mailRetryCount < 2) {
                                            channels = [channelList.team];
                                            setTimeout(() => sendReport(subject, toMailList, mailBody, reportTitle, imagefilename),
                                                retryDelay);
                                        }
                                    });

                            }).catch(async function (error) {
                                logger.error({
                                    level: 'error',
                                    message: 'error while generating image' + thresholdAlertEmail ? ' for threshold alert' : 'error while generating image',
                                    errMsg: error,
                                });
                                await updateSchedulerTaskLog(error, shedularlog, channelList.team);
                            });
                        }
                    }
                    sendReport(subject, toMailList, mailBody, reportTitle);

                }, async function (err) {
                    logger.error({
                        level: 'error',
                        message: thresholdAlertEmail ? 'error while generating chart for threshold alert ' + err : 'error while generating chart ' + err,
                        errMsg: err,
                    });
                    channelStatus = [];
                    for (let index = 0; index < channels.length; index++) {
                        channelStatus.push(
                            {
                                channel: channels[index],
                                notificationSent: false,
                                status: "Visualisation disabled due to configuration changes. Please reschedule the report to activate."
                            }
                        )
                    }
                    let shedularlog = models.SchedulerTaskLog.create({
                        SchedulerJobId: reports_data['report_shedular_obj']['id'],
                        task_executed: new Date(Date.now()).toISOString(),
                        task_status: "error while generating chart",
                        thresholdMet: true,
                        notificationSent: false,
                        channel: JSON.stringify(channelStatus),
                    });

                });
            } else {

                channelStatus = [];
                for (let index = 0; index < channels.length; index++) {
                    channelStatus.push(
                        {
                            channel: channels[index],
                            notificationSent: false,
                            status: "-"
                        }
                    )
                }

                logger.error({
                    level: 'error',
                    message: "no data found",
                    errMsg: "no data found",
                });
                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: "no data found",
                    thresholdMet: false,
                    notificationSent: false,
                    channel: JSON.stringify(channelStatus),
                });
            }
        }, function (err) {
            logger.error({
                level: 'error',
                message: thresholdAlertEmail ? 'error while fetching records from GRPC for threshold alert' + err : 'error while fetching records from GRPC' + err,
                errMsg: err,
            });
            if (grpcRetryCount < 2) {
                setTimeout(() => loadDataFromGrpc(query), retryDelay);
            }
            else {
                var channels = reports_data['report_assign_obj']['channel'];
                channelStatus = [];
                for (let index = 0; index < channels.length; index++) {
                    channelStatus.push(
                        {
                            channel: channels[index],
                            notificationSent: false,
                            status: "error while fetching records from GRPC"
                        }
                    )
                }

                let shedularlog = models.SchedulerTaskLog.create({
                    SchedulerJobId: reports_data['report_shedular_obj']['id'],
                    task_executed: new Date(Date.now()).toISOString(),
                    task_status: thresholdAlertEmail ? 'error while fetching records from GRPC for threshold alert' + err : 'error while fetching records from GRPC' + err,
                    thresholdMet: thresholdAlertEmail,
                    notificationSent: false,
                    channel: JSON.stringify(channelStatus),
                });
            }
        })
    }

    loadDataFromGrpc(query);

}
