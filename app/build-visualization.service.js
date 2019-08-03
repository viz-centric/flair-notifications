var models = require('./database/models/index');
var wkhtmltoimage = require('wkhtmltoimage');
var grpc_client = require('./grpc/client');
var charts = require('./chart/generate-charts');
var logger = require('./logger');
var fs = require('fs');
var AppConfig = require('./load_config');
var image_dir = AppConfig.imageFolder;
var base64Img = require('base64-img');


const retryDelay = 3000 //in miliseconds

var wkhtmltoimage = wkhtmltoimage.setCommand('/usr/bin/wkhtmltoimage');

const chartMap = {
    'Pie Chart': {
        generateChart: function (report, data) {
            return charts.pieChart(report.visualizationId, data);
        }
    },
    'Line Chart': {
        generateChart: function (report, data) {
            return charts.lineChart(report.visualizationId, data);
        }
    },
    'Clustered Vertical Bar Chart': {
        generateChart: function (report, data) {
            return charts.clusteredverticalBarChart(report.visualizationId, data);
        }
    },
    'Clustered Horizontal Bar Chart': {
        generateChart: function (report, data) {
            return charts.clusteredhorizontalBarChart(report.visualizationId, data);
        }
    },
    'Heat Map': {
        generateChart: function (report, data) {
            var config = {
                dimension: report.dimension,
                measure: report.measure,
            }
            return charts.heatmapChart(config, data);
        }
    },
    'Stacked Vertical Bar Chart': {
        generateChart: function (report, data) {
            return charts.stackedverticalBarChart(report.visualizationId, data);
        }
    },
    'Stacked Horizontal Bar Chart': {
        generateChart: function (report, data) {
            return charts.stackedhorizontalBarChart(report.visualizationId, data);
        }
    },
    'Combo Chart': {
        generateChart: function (report, data) {
            return charts.comboChart(report.visualizationId, data);
        }
    },
    'Tree Map': {
        generateChart: function (report, data) {
            return charts.treemapChart(report.visualizationId, data);
        }
    },
    'Info-graphic': {
        generateChart: function (report, data) {
            return charts.infographicsChart(report.visualizationId, data);
        }
    },
    'Box Plot': {
        generateChart: function (report, data) {
            var config = {
                dimension: report.dimension,
                measure: report.measure,
            }
            return charts.boxplotChart(config, data);
        }
    },
    'Bullet Chart': {
        generateChart: function (report, data) {
            var config = {
                dimension: report.dimension,
                measure: report.measure,
            }
            return charts.bulletChart(config, data);
        }
    },
    'Sankey': {
        generateChart: function (report, data) {
            var config = {
                dimension: report.dimension,
                measure: report.measure,
            }
            return charts.sankeyChart(config, data);
        }
    },
    'Table': {
        generateChart: function (report, data) {
            return charts.tableChart(report.visualizationId, data);
        }
    },
    'Pivot Table': {
        generateChart: function (report, data) {
            return charts.pivottableChart(report.visualizationId, data);
        }
    },
    'Doughnut Chart': {
        generateChart: function (report, data) {
            return charts.doughnutChart(report.visualizationId, data);
        }
    },
    'KPI': {
        generateChart: function (report, data) {
            return charts.kpiChart(report.visualizationId, data);
        }
    },
    'Scatter plot': {
        generateChart: function (report, data) {
            return charts.scatterChart(report.visualizationId, data);
        }
    },
    'Gauge plot': {
        generateChart: function (report, data) {
            var config = {
                dimension: report.dimension,
                measure: report.measure,
            }
            return charts.gaugeChart(config, data);
        }
    },
};

exports.loadDataAndBuildVisualization = function loadDataAndBuildVisualization(report,thresholdAlertEmail) {
    return new Promise((resolve, reject) => {
        let query = thresholdAlertEmail?report.queryHaving:report.query;
        function loadDataFromGrpc(query) {
            var data_call = grpc_client.getRecords(query);
            data_call.then(function (response) {
                var json_res = JSON.parse(response.data);
                generate_chart = chartMap[report.visualization].generateChart(report, json_res.data);
                generate_chart.then(function (response) {
                    var imagefilename =thresholdAlertEmail?'threshold_alert_chart_'+report.visualizationId:report.visualizationId +new Date().getTime()+'.png';
                    wkhtmltoimage.generate(response, { output: image_dir + imagefilename }, function (code, signal) {
                        base64Img.base64(image_dir + imagefilename, function(err, data) {
                            var encodedUrl = "data:image/png;base64,"+ data;
                            fs.unlink(image_dir + imagefilename);
                            resolve(encodedUrl);
                            //return ;
                        });
                    });
                }, function (err) {
                    logger.log({
                        level: 'error',
                        message: 'error while generating chart : '+err,
                        errMsg: err,
                    });
                    reject({message: 'error while generating chart : '+err});
                    //return {message: 'error while generating chart : '+err};
                });
            }, function (err) {
                logger.log({
                    level: 'error',
                    message: 'error while fetching records data from GRPC'+err,
                    errMsg: err,
                });
                //return {message:'error while fetching records data from GRPC'+err};
                reject({message:'error while fetching records data from GRPC'+err});
            })
        }
        loadDataFromGrpc(query);
    });
}

