const request = require('request');
const VisualizationUtils = require('./visualization-util');
const logger = require('../logger');
const discovery = require('../discovery');

const vizUrl = "/api/external/visualMetaDataById";
let flairBiUrl;

async function init() {
    flairBiUrl = await discovery.getAppUrl('FLAIRBI') + vizUrl;
    logger.info('FlairBi API base URL ' + flairBiUrl);
}

init();

var configs = {
    barChartConfig: function (viz_id, report_obj) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                logger.info('flairBi API end point ' + flairBiUrl + "/" + viz_id);
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for bar chart' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;
                            var result = {};
                            result['dimension'] = report_obj.report_line_obj.dimension; //VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = report_obj.report_line_obj.measure;//VisualizationUtils.getNames(measures);
                            result['maxMes'] = measures.length;
                            result['showXaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis');
                            result['showYaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis');
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'Y Axis Colour');
                            result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis Label');
                            result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis Label');
                            result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(properties, 'Axis Scale Label');
                            result['showLegend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position').toLowerCase();
                            result['showGrid'] = VisualizationUtils.getPropertyValue(properties, 'Show grid');
                            result['isFilterGrid'] = false;
                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['displayColorExpression'] = [];
                            result['textColorExpression'] = [];
                            for (var i = 0; i < result.maxMes; i++) {

                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                            }

                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug(

                                'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            );
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for bar chart ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for bar chart ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },

    lineChartConfig: function (viz_id, report_obj) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for line' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = report_obj.report_line_obj.dimension; //VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = report_obj.report_line_obj.measure;//VisualizationUtils.getNames(measures);

                            result['maxMes'] = measures.length;

                            result['showXaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis');
                            result['showYaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis');
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'Y Axis Colour');
                            result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis Label');
                            result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis Label');
                            result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(properties, 'Axis Scale Label');
                            result['showLegend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position');
                            result['stacked'] = VisualizationUtils.getPropertyValue(properties, 'Stacked');
                            result['showGrid'] = VisualizationUtils.getPropertyValue(properties, 'Show grid');
                            result['isFilterGrid'] = false;
                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['displayColorExpression'] = [];
                            result['textColorExpression'] = [];
                            result['lineType'] = [];
                            result['pointType'] = [];
                            for (var i = 0; i < result.maxMes; i++) {
                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type'));
                                result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for line chart ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }

                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for line' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    comboChartConfig: function (viz_id, report_obj) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for combo ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = report_obj.report_line_obj.dimension; //VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = report_obj.report_line_obj.measure;//VisualizationUtils.getNames(measures);

                            result['maxMes'] = measures.length;

                            result['showXaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis');
                            result['showYaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis');
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'Y Axis Colour');
                            result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis Label');
                            result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis Label');
                            result['axisScaleLabel'] = VisualizationUtils.getPropertyValue(properties, 'Axis Scale Label');
                            result['showLegend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position');
                            result['showGrid'] = VisualizationUtils.getPropertyValue(properties, 'Show grid');
                            result['isFilterGrid'] = false;
                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            result['displayColorExpression'] = [];
                            result['textColorExpression'] = [];
                            result['comboChartType'] = [];
                            result['lineType'] = [];
                            result['pointType'] = [];
                            for (var i = 0; i < result.maxMes; i++) {
                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                                result['displayColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['comboChartType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Combo chart type'));
                                result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type'));
                                result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for combo' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }

                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for combo' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    scatterPlotConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for scatter Plot ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;
                            var result = {};
                            result['dimension'] = VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = VisualizationUtils.getNames(measures);
                            result['maxMes'] = measures.length;

                            result['showXaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis');
                            result['showYaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis');
                            result['xAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'X Axis Colour');
                            result['yAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'Y Axis Colour');
                            result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis Label');
                            result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis Label');
                            result['showLegend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position').toLowerCase();
                            result['showGrid'] = VisualizationUtils.getPropertyValue(properties, 'Show grid');

                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['showValues'] = [];
                            result['displayNameForMeasure'] = [];
                            result['fontStyle'] = [];
                            result['fontWeight'] = [];
                            result['fontSize'] = [];
                            result['numberFormat'] = [];
                            result['textColor'] = [];
                            result['displayColor'] = [];
                            result['borderColor'] = [];
                            for (var i = 0; i < result.maxMes; i++) {
                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                var borderColor = VisualizationUtils.getFieldPropertyValue(measures[i], 'Border colour');
                                result['borderColor'].push((borderColor == null) ? colorSet[i] : borderColor);
                            }

                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for scatter Plot' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }

                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for scatter Plot' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    pieChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for pie' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var result = {};
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimension = features.dimensions,
                                measure = features.measures;
                            result['dimension'] = VisualizationUtils.getNames(dimension);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                            result['measure'] = VisualizationUtils.getNames(measure);
                            result['legend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position').toLowerCase();
                            result['valueAs'] = VisualizationUtils.getPropertyValue(properties, 'Show value as').toLowerCase();
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for pie ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for pie ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    DoughnutChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for doughnut' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var result = {};
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimension = features.dimensions,
                                measure = features.measures;
                            result['dimension'] = VisualizationUtils.getNames(dimension);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                            result['measure'] = VisualizationUtils.getNames(measure);
                            result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display name') || result['dimension'][0];
                            result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display name') || result['measure'][0];

                            result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size');
                            result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font style');
                            result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font weight');
                            result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Show Labels');
                            result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Colour of labels');

                            result['legend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                            result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position').toLowerCase();
                            result['valueAs'] = VisualizationUtils.getPropertyValue(properties, 'Show value as').toLowerCase();
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for doughnut' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for doughnut' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }

        });

        return chartconfigPromise;

    },
    gaugePlotConfig: function (viz_id) {
        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for doughnut' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var result = {};
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimension = features.dimensions,
                                measures = features.measures;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });

                            result['measures'] = VisualizationUtils.getNames(measures);
                            result['gaugeType'] = VisualizationUtils.getPropertyValue(properties, 'Gauge Type').toLowerCase();
                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['measures'][0];
                            result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                            var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                            result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                            result['isGradient'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Enable Gradient Color');
                            result['textColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                            result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                            result['targetDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display name') || result['measures'][1];
                            result['targetFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font style');
                            result['targetFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Font weight');
                            result['targetShowValues'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Value on Points');
                            var targetDisplayColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Display colour');
                            result['targetDisplayColor'] = (targetDisplayColor == null) ? colorSet[1] : targetDisplayColor
                            result['targetTextColor'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Text colour');
                            result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for  gauge plot ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for  gauge plot ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }

        });

        return chartconfigPromise;
    },

    tableChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for table' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);

                            result['measure'] = VisualizationUtils.getNames(measures);

                            result['maxDim'] = dimensions.length;
                            result['maxMes'] = measures.length;

                            result["displayNameForDimension"] = [];
                            result["cellColorForDimension"] = [];
                            result["fontStyleForDimension"] = [];
                            result["fontWeightForDimension"] = [];
                            result["fontSizeForDimension"] = [];
                            result["textColorForDimension"] = [];
                            result["textColorExpressionForDimension"] = [];
                            result["textAlignmentForDimension"] = [];

                            result["displayNameForMeasure"] = [];
                            result["cellColorForMeasure"] = [];
                            result["cellColorExpressionForMeasure"] = [];
                            result["fontStyleForMeasure"] = [];
                            result["fontSizeForMeasure"] = [];
                            result["fontWeightForMeasure"] = [];
                            result["numberFormatForMeasure"] = [];
                            result["textColorForMeasure"] = [];
                            result["textAlignmentForMeasure"] = [];
                            result["textColorExpressionForMeasure"] = [];
                            result["iconNameForMeasure"] = [];
                            result["iconFontWeight"] = [];
                            result["iconColor"] = [];
                            result["iconPositionForMeasure"] = [];
                            result["iconExpressionForMeasure"] = [];

                            for (var i = 0; i < result.maxDim; i++) {
                                result['displayNameForDimension'].push(
                                    VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name') ||
                                    result['dimension'][i]
                                );
                                result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
                                result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                                result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                                result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                                result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                                result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
                                result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
                            }

                            for (var i = 0; i < result.maxMes; i++) {
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
                                result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
                                result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
                                result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
                                result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for table' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for table' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });
        return chartconfigPromise;

    },
    pivottableChartConfig: function (viz_id) {
        var chartconfigPromise = new Promise((resolve, reject) => {
            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for pivot table' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = VisualizationUtils.getNames(measures);

                            result['maxDim'] = dimensions.length;
                            result['maxMes'] = measures.length;

                            result["displayNameForDimension"] = [];
                            result["cellColorForDimension"] = [];
                            result["fontStyleForDimension"] = [];
                            result["fontWeightForDimension"] = [];
                            result["fontSizeForDimension"] = [];
                            result["textColorForDimension"] = [];
                            result["textColorExpressionForDimension"] = [];
                            result["textAlignmentForDimension"] = [];
                            result['isPivoted'] = [];

                            result["displayNameForMeasure"] = [];
                            result["cellColorForMeasure"] = [];
                            result["cellColorExpressionForMeasure"] = [];
                            result["fontStyleForMeasure"] = [];
                            result["fontSizeForMeasure"] = [];
                            result["fontWeightForMeasure"] = [];
                            result["numberFormatForMeasure"] = [];
                            result["textColorForMeasure"] = [];
                            result["textAlignmentForMeasure"] = [];
                            result["textColorExpressionForMeasure"] = [];
                            result["iconNameForMeasure"] = [];
                            result["iconFontWeight"] = [];
                            result["iconColor"] = [];
                            result["iconPositionForMeasure"] = [];
                            result["iconExpressionForMeasure"] = [];
                            for (var i = 0; i < result.maxDim; i++) {
                                result['displayNameForDimension'].push(
                                    VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display name') ||
                                    result['dimension'][i]
                                );
                                result['cellColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Cell colour'));
                                result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                                result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                                result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                                result['textColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                                result['textColorExpressionForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour expression'));
                                result['textAlignmentForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Alignment'));
                                result['isPivoted'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Pivot'));

                            }

                            for (var i = 0; i < result.maxMes; i++) {
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['cellColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour'));
                                result['cellColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Cell colour expression'));
                                result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormatForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['textColorForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['textAlignmentForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text alignment').toLowerCase());
                                result['textColorExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['iconNameForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                result['iconPositionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position'));
                                result['iconExpressionForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for pivot table' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for pivot table' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });
        return chartconfigPromise;
    },
    KPIChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for KPI' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var result = {};
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimension = features.dimensions,
                                measures = features.measures;
                            result['dimension'] = VisualizationUtils.getNames(dimension);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                            result['measure'] = VisualizationUtils.getNames(measures);
                            result['kpiAlignment'] = VisualizationUtils.getPropertyValue(properties, 'Text alignment');

                            result['kpiDisplayName'] = [];

                            result['kpiBackgroundColor'] = [];
                            result['kpiNumberFormat'] = [];
                            result['kpiFontStyle'] = [];
                            result['kpiFontWeight'] = [];
                            result['kpiFontSize'] = [];
                            result['kpiColor'] = [];
                            result['kpiColorExpression'] = [];
                            result['kpiIcon'] = [];
                            result['kpiIconFontWeight'] = [];
                            result['kpiIconColor'] = [];
                            result['kpiIconExpression'] = [];
                            result['FontSizeforDisplayName'] = [];
                            result['showIcon'] = [];
                            result['iconSize'] = [];
                            for (var i = 0; i < measures.length; i++) {
                                result['kpiDisplayName'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['kpiBackgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                                result['kpiNumberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['kpiFontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['kpiFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['kpiFontSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size'));
                                result['kpiColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['kpiColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                                result['kpiIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                result['kpiIconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                                result['kpiIconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon colour'));
                                result['kpiIconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                                result['FontSizeforDisplayName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size for diplay name'));
                                result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
                                result['iconSize'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font size'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for KPI ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });
            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for KPI ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });
        return chartconfigPromise;

    },
    infographicsChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for info graphics ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = VisualizationUtils.getNames(measures);

                            result['chartType'] = VisualizationUtils.getPropertyValue(properties, 'Info graphic Type').toLowerCase();
                            var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display colour');
                            result['chartDisplayColor'] = (displayColor == null) ? colorSet[0] : displayColor;
                            var borderColor = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Border colour');
                            result['chartBorderColor'] = (borderColor == null) ? colorSet[0] : borderColor;

                            result['kpiDisplayName'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display name') || result['dimension'][0];
                            result['kpiAlignment'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text alignment');
                            result['kpiBackgroundColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Background Colour');
                            result['kpiNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                            result['kpiFontStyle'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['kpiFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['kpiFontSize'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size');
                            result['kpiColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                            result['kpiColorExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour expression');
                            result['kpiIcon'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon name');
                            result['kpiIconFontWeight'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Font weight');
                            result['kpiIconColor'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon colour');
                            result['kpiIconExpression'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Icon Expression');
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for info graphics' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for info graphics' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    mapChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for map ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimension = features.dimensions,
                                measure = features.measures;

                            result['dimension'] = VisualizationUtils.getNames(dimension);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                            result['measure'] = VisualizationUtils.getNames(measure);

                            result['colorPattern'] = VisualizationUtils.getPropertyValue(properties, 'Color Pattern').toLowerCase().replace(' ', '_');
                            result['colorSet'] = colorSet;
                            result['colourOfLabels'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Colour of labels');
                            result['displayColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display colour');
                            result['textColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Text colour');
                            result['borderColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Border colour');
                            result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                            result['showValue'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Value on Points');
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for map' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for map' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },

    treemapChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for treemap ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['maxDim'] = dimensions.length;
                            result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                            result['showValues'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Value on Points');
                            result['valueTextColour'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Text colour');
                            result['fontStyleForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font style');
                            result['fontWeightForMes'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Font weight');
                            result['fontSizeForMes'] = parseInt(VisualizationUtils.getFieldPropertyValue(measures[0], 'Font size'));
                            result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                            result['measure'] = [measures[0].feature.name];
                            result['dimension'] = [];
                            result['dimensionType'] = [];
                            result['showLabelForDimension'] = [];
                            result['labelColorForDimension'] = [];
                            result['fontStyleForDimension'] = [];
                            result['fontWeightForDimension'] = [];
                            result['fontSizeForDimension'] = [];
                            result['displayColor'] = [];
                            result['colorSet'] = colorSet;

                            for (var i = 0, j = ''; i < result.maxDim; i++ , j = i + 1) {
                                result['dimension'].push(dimensions[i].feature.name);
                                result['dimensionType'].push(dimensions[i].feature.type);
                                result['showLabelForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                                result['labelColorForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Colour of labels'));
                                var displayColor = VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Display colour');
                                result['displayColor'].push((displayColor == null) ? colorSet[i] : displayColor);
                                result['fontWeightForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                                result['fontStyleForDimension'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                                result['fontSizeForDimension'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for treemap' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for treemap' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    heatMapChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for heatmap' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = [VisualizationUtils.getNames(dimensions)[0]];

                            result['measure'] = VisualizationUtils.getNames(measures);
                            result['maxMes'] = measures.length;
                            result['dimLabelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                            result['displayName'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Display name') || result['dimension'][0];
                            result['fontStyleForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                            result['fontWeightForDimension'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                            result['fontSizeForDimension'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                            result["colorPattern"] = VisualizationUtils.getPropertyValue(properties, "Color Pattern").toLowerCase().replace(' ', '_');

                            var displayColor = VisualizationUtils.getPropertyValue(properties, 'Display colour');
                            result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor;

                            result['displayNameForMeasure'] = [];
                            result['showValues'] = [];
                            result['showIcon'] = [];
                            result['valuePosition'] = [];
                            result['iconName'] = [];
                            result['iconExpression'] = [];
                            result['iconFontWeight'] = [];
                            result['iconPosition'] = [];
                            result['iconColor'] = [];
                            result['colourCoding'] = [];
                            result['valueTextColour'] = [];
                            result['displayColorMeasure'] = [];
                            result['fontStyleForMeasure'] = [];
                            result['fontWeightForMeasure'] = [];
                            result['fontSizeForMeasure'] = [];
                            result['numberFormat'] = [];

                            for (var i = 0; i < result.maxMes; i++) {
                                result['displayNameForMeasure'].push(
                                    VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                    result['measure'][i]
                                );
                                result['showValues'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Value on Points'));
                                result['showIcon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Show Icon'));
                                result['valuePosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Alignment').toLowerCase());
                                result['iconName'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                                result['iconFontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Font weight'));
                                result['iconPosition'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon position').toLowerCase());
                                result['iconColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['colourCoding'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Display colour expression'));
                                result['valueTextColour'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                                result['displayColorMeasure'].push(colorSet[i]);
                                result['fontStyleForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                                result['fontWeightForMeasure'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                                result['fontSizeForMeasure'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                                result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                                result['iconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                            }
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for heatmap ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for heatmap ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;
    },
    boxplotChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for boxplot' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['dimension'] = [VisualizationUtils.getNames(dimensions)[0]];
                            result['measure'] = VisualizationUtils.getNames(measures);

                            result["dimension"] = ['country']//D3Utils.getNames(dimensions)[0];
                            result["measure"] = ['low', 'qone', 'median', 'qthree', 'high']//D3Utils.getNames(measures);

                            result["showXaxis"] = VisualizationUtils.getPropertyValue(properties, "Show X Axis");
                            result["showYaxis"] = VisualizationUtils.getPropertyValue(properties, "Show Y Axis");
                            result["axisColor"] = VisualizationUtils.getPropertyValue(properties, "Axis Colour");
                            result["colorPattern"] = VisualizationUtils.getPropertyValue(properties, "Color Pattern");
                            result["numberFormat"] = VisualizationUtils.getFieldPropertyValue(dimensions[0], "Number format");

                            console.log("---------------" + JSON.stringify(result) + "------------")
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for boxplot chart' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for boxplot chart' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;
    },
    chorddiagramChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for chord diagram ' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    try {
                        if (response && response.statusCode == 200) {
                            var json_res = JSON.parse(body);
                            var result = {};
                            var properties = json_res.visualMetadata.properties;
                            var fields = json_res.visualMetadata.fields;
                            var visualizationColors = json_res.visualizationColors;
                            var colorSet = [];
                            visualizationColors.forEach(function (obj) {
                                colorSet.push(obj.code)
                            });
                            var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                                dimensions = features.dimensions,
                                measures = features.measures;

                            result['showLabels'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Show Labels');
                            result['labelColor'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Colour of labels');
                            result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                            result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                            result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                            result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');
                            result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                            result['dimension'] = VisualizationUtils.getNames(dimensions);
                            result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                            result['measure'] = VisualizationUtils.getNames(measures)[0];
                            resolve(result);
                        }
                        else {
                            logger.error({
                                level: 'error',
                                message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                                errMsg: error,
                            });
                            logger.debug({
                                level: 'debug',
                                message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                            });
                            reject(error);
                        }
                    } catch (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while processing config for chord diagram ' + viz_id,
                            errMsg: error,
                        });
                        reject(error);
                    }

                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for chord diagram ' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });
        return chartconfigPromise;

    },

    textObjectChartConfig: function (viz_id, data) {
        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for text Object' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    if (response && response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var result = {};
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet = [];
                        visualizationColors.forEach(function (obj) {
                            colorSet.push(obj.code)
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;

                        result['measure'] = VisualizationUtils.getNames(measures);
                        result['maxMes'] = measures.length;
                        result['descriptive'] = VisualizationUtils.getPropertyValue(properties, 'Descriptive');
                        result['alignment'] = VisualizationUtils.getPropertyValue(properties, 'Alignment');
                        result['textFormat'] = VisualizationUtils.getPropertyValue(properties, 'Text format');
                        result['value'] = [];
                        result['backgroundColor'] = [];
                        result['textColor'] = [];
                        result['underline'] = [];
                        result['fontStyle'] = [];
                        result['fontWeight'] = [];
                        result['fontSize'] = [];
                        result['icon'] = [];
                        result['numberFormat'] = [];
                        result['displayNameForMeasure'] = [];
                        result['iconExpression'] = [];
                        result['textColorExpression'] = [];

                        for (var i = 0; i < measures.length; i++) {
                            result['displayNameForMeasure'].push(
                                VisualizationUtils.getFieldPropertyValue(measures[i], 'Display name') ||
                                result['measure'][i]
                            );
                            result['value'].push(data[0][result["measure"][i]]);
                            result['backgroundColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Background Colour'));
                            result['textColor'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour'));
                            result['underline'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Underline'));
                            result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font style'));
                            result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font weight'));
                            result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(measures[i], 'Font size')));
                            result['icon'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon name'));
                            result['numberFormat'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Number format'));
                            result['iconExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Icon Expression'));
                            result['textColorExpression'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Text colour expression'));
                        }
                        resolve(result);
                    }
                    else {
                        logger.error({
                            level: 'error',
                            message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                            errMsg: error,
                        });
                        logger.debug({
                            level: 'debug',
                            message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for text Object' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },

    bulletChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for bullet' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    if (response && response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var result = {};
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet = [];
                        visualizationColors.forEach(function (obj) {
                            colorSet.push(obj.code)
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;

                        result['dimension'] = [VisualizationUtils.getNames(dimensions)[0]];
                        result['dimensionType'] = [VisualizationUtils.getTypes(dimensions)[0]];
                        result['measures'] = VisualizationUtils.getNames(measures);

                        result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font style');
                        result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font weight');
                        result['fontSize'] = parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Font size'));
                        result['showLabel'] = VisualizationUtils.getFieldPropertyValue(dimensions[0], 'Value on Points');

                        var valueColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                        result['valueColor'] = (valueColor == null) ? colorSet[0] : valueColor;
                        var targetColor = VisualizationUtils.getFieldPropertyValue(measures[1], 'Target colour');
                        result['targetColor'] = (targetColor == null) ? colorSet[1] : targetColor;

                        result['orientation'] = VisualizationUtils.getPropertyValue(properties, 'Orientation');
                        result['segments'] = VisualizationUtils.getPropertyValue(properties, 'Segments');
                        result['segmentInfo'] = VisualizationUtils.getPropertyValue(properties, 'Segment Color Coding');
                        result['measureNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                        result['targetNumberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[1], 'Number format');

                        resolve(result);
                    }
                    else {
                        logger.error({
                            level: 'error',
                            message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                            errMsg: error,
                        });
                        logger.debug({
                            level: 'debug',
                            message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for bullet chart' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    sankeyChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for sankey' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    if (response && response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var result = {};
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet = [];
                        visualizationColors.forEach(function (obj) {
                            colorSet.push(obj.code)
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;

                        result['dimension'] = VisualizationUtils.getNames(dimensions);
                        result['dimensionType'] = VisualizationUtils.getTypes(dimensions);
                        result['measure'] = VisualizationUtils.getNames(measures);

                        result['maxDim'] = dimensions.length;
                        result['maxMes'] = measures.length;

                        result['colorPattern'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Color Pattern').toLowerCase().replace(' ', '_');

                        var displayColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Display colour');
                        result['displayColor'] = (displayColor == null) ? colorSet[0] : displayColor
                        var borderColor = VisualizationUtils.getFieldPropertyValue(measures[0], 'Border colour');
                        result['borderColor'] = (borderColor == null) ? colorSet[1] : borderColor
                        result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measures[0], 'Number format');
                        result['showLabels'] = [];
                        result['fontStyle'] = [];
                        result['fontWeight'] = [];
                        result['fontSize'] = [];
                        result['textColor'] = [];
                        result['colorList'] = colorSet;
                        for (var i = 0; i < result.maxDim; i++) {
                            result['showLabels'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Show Labels'));
                            result['fontStyle'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font style'));
                            result['fontWeight'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font weight'));
                            result['fontSize'].push(parseInt(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Font size')));
                            result['textColor'].push(VisualizationUtils.getFieldPropertyValue(dimensions[i], 'Text colour'));
                        }
                        resolve(result);
                    }
                    else {
                        logger.error({
                            level: 'error',
                            message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                            errMsg: error,
                        });
                        logger.debug({
                            level: 'debug',
                            message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for sankey chart' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    piegridChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for pie grid' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    if (response && response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var result = {};
                        var colorSet = [];
                        visualizationColors.forEach(function (obj) {
                            colorSet.push(obj.code)
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimension = features.dimensions,
                            measure = features.measures;
                        result['dimension'] = VisualizationUtils.getNames(dimension);
                        result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                        result['measure'] = VisualizationUtils.getNames(measure);
                        result['colorSet'] = colorSet;

                        result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display name') || result['dimension'][0];
                        result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display name') || result['measure'][0];
                        result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                        result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size');
                        result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font style');
                        result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font weight');
                        result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Show Labels');
                        result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Colour of labels');
                        result['showValue'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Value on Points');

                        resolve(result);
                    }
                    else {
                        logger.error({
                            level: 'error',
                            message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                            errMsg: error,
                        });
                        logger.debug({
                            level: 'debug',
                            message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for pie grid' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    numbergridChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(flairBiUrl + "/" + viz_id, function (error, response, body) {
                    if (error) {
                        logger.error({
                            level: 'error',
                            message: 'error while fetching config for number grid' + viz_id,
                            errMsg: error,
                        });
                        reject(error.message);
                        return;
                    }
                    if (response && response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var visualizationColors = json_res.visualizationColors;
                        var fields = json_res.visualMetadata.fields;
                        var result = {};
                        var colorSet = [];
                        visualizationColors.forEach(function (obj) {
                            colorSet.push(obj.code)
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimension = features.dimensions,
                            measure = features.measures;
                        result['dimension'] = VisualizationUtils.getNames(dimension);
                        result['dimensionType'] = VisualizationUtils.getTypes(dimension);
                        result['measure'] = VisualizationUtils.getNames(measure);
                        result['colorSet'] = colorSet;
                        result['dimensionDisplayName'] = VisualizationUtils.getFieldPropertyValue(dimension[0], 'Display name') || result['dimension'][0];
                        result['measureDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Display name') || result['measure'][0];
                        result['numberFormat'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Number format');
                        result['fontSize'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size');
                        result['fontStyle'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font style');
                        result['fontWeight'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font weight');
                        result['showLabel'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Show Labels');
                        result['showValue'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Value on Points');
                        result['fontColor'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Colour of labels');
                        result['fontSizeforDisplayName'] = VisualizationUtils.getFieldPropertyValue(measure[0], 'Font size for diplay name');
                        resolve(result);
                    }
                    else {
                        logger.error({
                            level: 'error',
                            message: 'error in ' + flairBiUrl + "/" + viz_id + " API reponse",
                            errMsg: error,
                        });
                        logger.debug({
                            level: 'debug',
                            message: 'API response :  ' + response.statusCode + '  response body:  ' + JSON.parse(body).message
                        });
                        reject(error);
                    }
                });

            } catch (error) {
                logger.error({
                    level: 'error',
                    message: 'error while processing config for number grid' + viz_id,
                    errMsg: error,
                });
                reject(error);
            }
        });

        return chartconfigPromise;

    }
}

module.exports = configs;
