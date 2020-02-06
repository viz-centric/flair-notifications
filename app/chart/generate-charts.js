const d3 = require('d3');
const pie = require('flair-visualizations/js/charts/pie');
const line = require('flair-visualizations/js/charts/line');
const clusteredverticalbar = require('flair-visualizations/js/charts/clusteredverticalbar');
const clusteredhorizontalbar = require('flair-visualizations/js/charts/clusteredhorizontalbar');
const stackedhorizontalbar = require('flair-visualizations/js/charts/stackedhorizontalbar');
const stackedverticalbar = require('flair-visualizations/js/charts/stackedverticalbar');
const heatmap = require('flair-visualizations/js/charts/heatmap');
const combo = require('flair-visualizations/js/charts/combo');
const treemap = require('flair-visualizations/js/charts/treemap');
const infographics = require('flair-visualizations/js/charts/infographics');
const boxplot = require('flair-visualizations/js/charts/boxplot');
const bullet = require('flair-visualizations/js/charts/bullet');
const sankey = require('flair-visualizations/js/charts/sankey');
const table = require('flair-visualizations/js/charts/table');
const pivottable = require('flair-visualizations/js/charts/pivottable');
const doughnut = require('flair-visualizations/js/charts/doughnut');
const kpi = require('flair-visualizations/js/charts/kpi');
const scatter = require('flair-visualizations/js/charts/scatter');
const gauge = require('flair-visualizations/js/charts/gauge');
const textobject = require('flair-visualizations/js/charts/textobject');
const chorddiagram = require('flair-visualizations/js/charts/chorddiagram');
const piegrid = require('flair-visualizations/js/charts/piegrid');
const numbergrid = require('flair-visualizations/js/charts/numbergrid');
const map = require('flair-visualizations/js/charts/map');
const load_config = require('./load-config');
const jsdom = require('jsdom');
const chartUtility = require('./chart-util');
const { JSDOM } = jsdom;


var charts = {
  clusteredverticalBarChart: async function (viz_id, data) {
    var clusteredverticalBarFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="clusteredverticalBar" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(clusteredverticalBarFakeDom.window.document)

    var clusteredverticalBarChartObj = clusteredverticalbar();
    var chartConfig = await load_config.barChartConfig(viz_id);

    clusteredverticalBarChartObj.config(chartConfig).print(true).data(data);
    clusteredverticalBarChartObj(d3.select(clusteredverticalBarFakeDom.window.document).select('#clusteredverticalBar'))
    return clusteredverticalBarChartObj._getHTML();
  },

  clusteredhorizontalBarChart: async function (viz_id, data) {
    var clusteredhorizontalBarFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="clusteredhorizontalBar" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(clusteredhorizontalBarFakeDom.window.document)

    var clusteredhorizontalBarChartObj = clusteredhorizontalbar();
    var chartConfig = await load_config.barChartConfig(viz_id);

    clusteredhorizontalBarChartObj.config(chartConfig).print(true).data(data);
    clusteredhorizontalBarChartObj(d3.select(clusteredhorizontalBarFakeDom.window.document).select('#clusteredhorizontalBar'))
    return clusteredhorizontalBarChartObj._getHTML();
  },

  stackedverticalBarChart: async function (viz_id, data) {
    var stackedverticalBarFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="stackedverticalBar" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(stackedverticalBarFakeDom.window.document)

    var stackedverticalBarChartObj = stackedverticalbar();
    var chartConfig = await load_config.barChartConfig(viz_id);

    stackedverticalBarChartObj.config(chartConfig).print(true).data(data);
    stackedverticalBarChartObj(d3.select(stackedverticalBarFakeDom.window.document).select('#stackedverticalBar'))
    return stackedverticalBarChartObj._getHTML();
  },

  stackedhorizontalBarChart: async function (viz_id, data) {
    var stackedhorizontalBarFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="stackedhorizontalBar" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(stackedhorizontalBarFakeDom.window.document)

    var stackedhorizontalBarChartObj = stackedhorizontalbar();
    var chartConfig = await load_config.barChartConfig(viz_id);

    stackedhorizontalBarChartObj.config(chartConfig).print(true).data(data);
    stackedhorizontalBarChartObj(d3.select(stackedhorizontalBarFakeDom.window.document).select('#stackedhorizontalBar'))
    return stackedhorizontalBarChartObj._getHTML();
  },

  lineChart: async function (viz_id, data) {

    var linefakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="line" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(linefakeDom.window.document);

    var linechart = line();
    var chartConfig = await load_config.lineChartConfig(viz_id);
    linechart.config(chartConfig).print(true).data(data);
    linechart(d3.select(linefakeDom.window.document).select('#line'))
    return linechart._getHTML();
  },

  comboChart: async function (viz_id, data) {

    var comboFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="combo" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(comboFakeDom.window.document)

    var comboChartObj = combo();
    var chartConfig = await load_config.comboChartConfig(viz_id);

    comboChartObj.config(chartConfig).print(true).data(data);
    comboChartObj(d3.select(comboFakeDom.window.document).select('#combo'))
    return comboChartObj._getHTML();
  },

  scatterChart: async function (viz_id, data) {
    var scatterFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="scatter" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(scatterFakeDom.window.document)

    var scatterChartObj = scatter();
    var chartConfig = await load_config.scatterPlotConfig(viz_id);

    scatterChartObj.config(chartConfig).print(true).data(data);
    scatterChartObj(d3.select(scatterFakeDom.window.document).select('#scatter'))
    return scatterChartObj._getHTML();
  },

  pieChart: async function (viz_id, data) {

    var pieFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="pie" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(pieFakeDom.window.document)

    var pieChartobj = pie();
    var chartConfig = await load_config.pieChartConfig(viz_id);
    chartConfig.valueAsArc = false; //for server side

    pieChartobj.config(chartConfig).print(true).data(data);
    pieChartobj(d3.select(pieFakeDom.window.document).select('#pie'))
    return pieChartobj._getHTML();
  },

  doughnutChart: async function (viz_id, data) {
    var doughnutFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="doughnut" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(doughnutFakeDom.window.document)

    var doughnutChartobj = doughnut();
    var chartConfig = await load_config.DoughnutChartConfig(viz_id);
    chartConfig.valueAsArc = false; //for server side

    doughnutChartobj.config(chartConfig).print(true).data(data);
    doughnutChartobj(d3.select(doughnutFakeDom.window.document).select('#doughnut'))
    return doughnutChartobj._getHTML();

  },

  gaugeChart: async function (config, data) {
    var gaugeFakeDom = new JSDOM('<!DOCTYPE html><html><body><svg id="gauge" width="950" height="440"/></body></html>');
    chartUtility.configureDomForcharts(gaugeFakeDom.window.document)
    var gaugeChartobj = gauge();
    var newConfig = convertConfigToLowerCase(config);
    var chartConfig = {
      displayColor: "#ed2c2c",
      displayName: "Display name",
      fontStyle: "Normal",
      fontWeight: "normal",
      gaugeType: "half circle",
      isGradient: false,
      measures: newConfig.measure,
      numberFormat: "Actual",
      showValues: false,
      targetDisplayColor: "#1824ed",
      targetDisplayName: "Display name",
      targetFontStyle: "Normal",
      targetFontWeight: "normal",
      targetNumberFormat: "Actual",
      targetShowValues: false,
      targetTextColor: "#617c8c",
      textColor: "#617c8c",
    }
    gaugeChartobj.config(chartConfig).print(true);
    d3.select(gaugeFakeDom.window.document).select('#gauge').datum(data).call(gaugeChartobj);

    let chartRenderingPromise = new Promise((resolve, reject) => {
      setTimeout(function () {
        var chartHtml = gaugeChartobj._getHTML();
        resolve(chartHtml)
      }, 2000);
    });
    result = await chartRenderingPromise;
    return result;

  },

  tableChart: async function (viz_id, data) {

    var tableFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="table" ></div></body></html>');
    chartUtility.configureDomForcharts(tableFakeDom.window.document)
    var tableChartobj = table();

    var chartConfig = await load_config.tableChartConfig(viz_id);
    tableChartobj.config(chartConfig).print(true).data(data);
    tableChartobj(d3.select(tableFakeDom.window.document).select('#table'))
    return tableChartobj._getHTML();
  },

  pivottableChart: async function (viz_id, data) {
    var pivottableFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="pivottable" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(pivottableFakeDom.window.document)
    var pivottableChartobj = pivottable();

    var chartConfig = await load_config.pivottableChartConfig(viz_id);
    pivottableChartobj.config(chartConfig).print(true).data(data);
    pivottableChartobj(d3.select(pivottableFakeDom.window.document).select('#pivottable'))
    return pivottableChartobj._getHTML();
  },

  kpiChart: async function (viz_id, data) {
    var kpiFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="kpi" width="600" height="600"></div></body></html>');
    chartUtility.configureDomForcharts(kpiFakeDom.window.document)
    var kpiChartobj = kpi();
    var chartConfig = await load_config.KPIChartConfig(viz_id);

    kpiChartobj.config(chartConfig).print(true).data(data);
    kpiChartobj(d3.select(kpiFakeDom.window.document).select('#kpi'))
    return kpiChartobj._getHTML();

  },

  infographicsChart: async function (viz_id, data) {

    var infographicsFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="infographics" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(infographicsFakeDom.window.document)

    var infographicsChartobj = infographics();
    var chartConfig = await load_config.infographicsChartConfig(viz_id);

    infographicsChartobj.config(chartConfig).print(true).data(data);
    infographicsChartobj(d3.select(infographicsFakeDom.window.document).select('#infographics'))
    return infographicsChartobj._getHTML();
  },

  mapChart: async function (viz_id, data) {
    var mapFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="map" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(mapFakeDom.window.document)

    var mapChartobj = map();
    var chartConfig = await load_config.mapChartConfig(viz_id);

    mapChartobj.config(chartConfig).print(true).data(data);
    mapChartobj(d3.select(mapFakeDom.window.document).select('#map'))
    return mapChartobj._getHTML();
  },

  treemapChart: async function (viz_id, data) {
    var treemapFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="treemap" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(treemapFakeDom.window.document)

    var treemapChartobj = treemap();
    var chartConfig = await load_config.treemapChartConfig(viz_id);

    treemapChartobj.config(chartConfig).print(true).data(data);
    treemapChartobj(d3.select(treemapFakeDom.window.document).select('#treemap'))
    return treemapChartobj._getHTML();
  },

  heatmapChart: async function (viz_id, data) {

    var heatmapFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="heatmap" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(heatmapFakeDom.window.document)

    var heatmapChartobj = heatmap();
    var chartConfig = await load_config.heatMapChartConfig(viz_id);

    heatmapChartobj.config(chartConfig).print(true).data(data);
    heatmapChartobj(d3.select(heatmapFakeDom.window.document).select('#heatmap'))
    return heatmapChartobj._getHTML();
  },

  boxplotChart: async function (viz_id, data) {
    var boxplotFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="boxplot" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(boxplotFakeDom.window.document)

    var boxplotChartobj = boxplot();
    var chartConfig = await load_config.boxplotChartConfig(viz_id);

    boxplotChartobj.config(chartConfig).print(true).data(data);
    boxplotChartobj(d3.select(boxplotFakeDom.window.document).select('#boxplot'))
    return boxplotChartobj._getHTML();
  },

  bulletChart: async function (viz_id, data) {

    var bulletFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="bullet" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(bulletFakeDom.window.document)

    var bulletChartobj = bullet();
    var chartConfig = await load_config.bulletChartConfig(viz_id);

    bulletChartobj.config(chartConfig).print(true).data(data);
    bulletChartobj(d3.select(bulletFakeDom.window.document).select('#bullet'))
    return bulletChartobj._getHTML();
  },

  chorddiagramChart: async function (viz_id, data) {
    var chorddiagramFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="chorddiagram" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(chorddiagramFakeDom.window.document)

    var chorddiagramChartobj = chorddiagram();
    var chartConfig = await load_config.chorddiagramChartConfig(viz_id);

    chorddiagramChartobj.config(chartConfig).print(true).data(data);
    chorddiagramChartobj(d3.select(chorddiagramFakeDom.window.document).select('#chorddiagram'))
    return chorddiagramChartobj._getHTML();
  },

  textObjectChart: async function (viz_id, data) {

    var textobjectFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="textobject" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(textobjectFakeDom.window.document)

    var textobjectChartobj = textobject();
    var chartConfig = await load_config.textObjectChartConfig(viz_id, data);

    textobjectChartobj.config(chartConfig).print(true);

    textobjectChartobj(d3.select(textobjectFakeDom.window.document).select('#textobject'))
    return textobjectChartobj._getHTML();
  },

  sankeyChart: async function (viz_id, data) {

    var sankeyFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="sankey" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(sankeyFakeDom.window.document)

    var sankeyChartobj = sankey();
    var chartConfig = await load_config.sankeyChartConfig(viz_id);

    sankeyChartobj.config(chartConfig).print(true).data(data);
    sankeyChartobj(d3.select(sankeyFakeDom.window.document).select('#sankey'))
    return sankeyChartobj._getHTML();
  },

  piegridChart: async function (viz_id, data) {

    var piegridFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="piegrid" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(piegridFakeDom.window.document)

    var piegridChartobj = piegrid();
    var chartConfig = await load_config.piegridChartConfig(viz_id);

    piegridChartobj.config(chartConfig).print(true).data(data);
    piegridChartobj(d3.select(piegridFakeDom.window.document).select('#piegrid'))
    return piegridChartobj._getHTML();
  },

  numbergridChart: async function (viz_id, data) {

    var numbergridFakeDom = new JSDOM('<!DOCTYPE html><html><body><div id="numbergrid" width="950" height="440"></div></body></html>');
    chartUtility.configureDomForcharts(numbergridFakeDom.window.document)

    var numbergridChartobj = numbergrid();
    var chartConfig = await load_config.numbergridChartConfig(viz_id);

    numbergridChartobj.config(chartConfig).print(true).data(data);
    numbergridChartobj(d3.select(numbergridFakeDom.window.document).select('#numbergrid'))
    return numbergridChartobj._getHTML();
  }
}

module.exports = charts;

function convertConfigToLowerCase(config) {
  var newDimension = []
  var newMeassure = []
  config.dimension.forEach(function (elm) {
    newDimension.push(elm.toLowerCase())
  });
  config.measure.forEach(function (elm) {
    newMeassure.push(elm.toLowerCase())
  });
  return config = { dimension: newDimension, measure: newMeassure }
}