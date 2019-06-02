const request = require('request');
const VisualizationUtils = require('./visualization-util');

const OLD_colorSet = ["#439dd3", "#0CC69A", "#556080", "#F0785A", "#F0C419", "#DBCBD8",
    "#D10257", "#BDDBFF", "#9BC9FF", "#8AD5DD", "#EFEFEF", "#FF2970", "#6DDDC2", "#778099",
    "#F3937B", "#F3D047", "#DA3579", "#8EA4BF"];

var AppConfig = require('../load_config');
const vizMetaApi = AppConfig.FlairBiEndPoint + "/api/external/visualMetaDataById";


var configs = {
    lineChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {
            
            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var result = {};
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet=[];
                        visualizationColors.forEach(function(obj) { 
                            colorSet.push(obj.code) 
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;
    
                        result['dimension'] = VisualizationUtils.getNames(dimensions);
                        result['measure'] = VisualizationUtils.getNames(measures);
    
                        result['maxMes'] = measures.length;
    
                        result['showXaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis');
                        result['showYaxis'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis');
                        result['xAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'X Axis Colour');
                        result['yAxisColor'] = VisualizationUtils.getPropertyValue(properties, 'Y Axis Colour');
                        result['showXaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show X Axis Label');
                        result['showYaxisLabel'] = VisualizationUtils.getPropertyValue(properties, 'Show Y Axis Label');
                        result['showLegend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                        result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position');
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
                            result['lineType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Type'));
                            result['pointType'].push(VisualizationUtils.getFieldPropertyValue(measures[i], 'Line Chart Point type'));
                        }
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
                });
                
            } catch (error) {
                reject(error);   
            }
        });

        return chartconfigPromise;

    },
    pieChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var result = {};
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimension = features.dimensions,
                            measure = features.measures;
                        result['dimension'] = VisualizationUtils.getNames(dimension);
                        result['measure'] = VisualizationUtils.getNames(measure);
                        result['legend'] = VisualizationUtils.getPropertyValue(properties, 'Show Legend');
                        result['legendPosition'] = VisualizationUtils.getPropertyValue(properties, 'Legend position').toLowerCase();
                        result['valueAs'] = VisualizationUtils.getPropertyValue(properties, 'Show value as').toLowerCase();
                        result['valueAsArc'] = VisualizationUtils.getPropertyValue(properties, 'Value as Arc');
                        result['valuePosition'] = VisualizationUtils.getPropertyValue(properties, 'Value position').toLowerCase();
                        console.log(result)
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
    
                });
            } catch (error) {
                reject(error);
            }
            
        });

        return chartconfigPromise;

    },
    clusteredverticalBarConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet=[];
                        visualizationColors.forEach(function(obj) { 
                            colorSet.push(obj.code) 
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;
                        var result = {};
                        result['dimension'] = VisualizationUtils.getNames(dimensions);
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
                        reject(error);
                    }
    
    
                });    
            } catch (error) {
                reject(error);
            }

            


        });

        return chartconfigPromise;

    },
    clusteredhorizontalBarConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet=[];
                        visualizationColors.forEach(function(obj) { 
                            colorSet.push(obj.code) 
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;
                        var result = {};
                        result['dimension'] = VisualizationUtils.getNames(dimensions);
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
                        reject(error);
                    }
    
    
                });    
            } catch (error) {
                reject(error);
            }
        });

        return chartconfigPromise;

    },
    stackedverticalBarConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet=[];
                        visualizationColors.forEach(function(obj) { 
                            colorSet.push(obj.code) 
                        });
                        var vis
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;
                        var result = {};
                        result['dimension'] = VisualizationUtils.getNames(dimensions);
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
                        reject(error);
                    }   
    
                });
            } catch (error) {
                reject(error);    
            }
        });

        return chartconfigPromise;

    },
    tableChartConfig: function (viz_id) {

        var chartconfigPromise = new Promise((resolve, reject) => {

            try {
                request(vizMetaApi + "/" + viz_id, function (error, response, body) {

                    if (response.statusCode == 200) {
                        var json_res = JSON.parse(body);
                        var result = {};
                        var properties = json_res.visualMetadata.properties;
                        var fields = json_res.visualMetadata.fields;
                        var visualizationColors = json_res.visualizationColors;
                        var colorSet=[];
                        visualizationColors.forEach(function(obj) { 
                            colorSet.push(obj.code) 
                        });
                        var features = VisualizationUtils.getDimensionsAndMeasures(fields),
                            dimensions = features.dimensions,
                            measures = features.measures;
    
                        result['dimension'] = VisualizationUtils.getNames(dimensions);
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
                          
                            }
                        resolve(result);
                    }
                    else {
                        reject(error);
                    }
    
    
                });
            } catch (error) {
                reject(error);
            }

        });

        return chartconfigPromise;

    },
}

module.exports = configs;