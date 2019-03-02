const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { document } = (new JSDOM('')).window;
global.document = document;

var originalData = [],
    helper;

var offsetX = 16,
    offsetY = 3;

var legendHeight = 20,
    axisLabelSpace = 20;

var tooltip;

var DEFAULT_COLOR = "#dedede";

var Helper = (function() {
    
    var fwFormat = {
        "bold": 900,
        "normal": 500,
    }

    var numberFormat = {
        "K": "1e3",
        "M": "1e6",
        "B": "1e9",
    };

    function Helper(config) {
        this.config = config;
        this.maxMes = config.maxMes;
        this.displayName = config.displayName;
        this.showLegend = config.showLegend;
        this.legendPosition = config.legendPosition;
        this.showXaxis = config.showXaxis;
        this.showYaxis = config.showYaxis;
        this.showXaxisLabel = config.showXaxisLabel;
        this.showYaxisLabel = config.showYaxisLabel;
        this.xAxisColor = config.xAxisColor;
        this.yAxisColor = config.yAxisColor;
        this.showGrid = config.showGrid;
        this.stacked = config.stacked;
        this.measureProp = config.forEachMeasure;
    }

    Helper.prototype.setDimension = function(dimension) {
        DIM = dimension;
    }

    Helper.prototype.setMeasure = function(measure) {
        MES = measure;
    }

    Helper.prototype.getMargin = function() {
        return {
            top: 0,
            right: 0,
            bottom: 0,
            left: 60
        };
    }

    Helper.prototype.getPadding = function() {
        return 20;
    }

    Helper.prototype.getGridVisibility = function() {
        return this.showGrid ? 'visible' : 'hidden';
    }

    Helper.prototype.getXaxisColor = function() {
        return this.xAxisColor;
    }

    Helper.prototype.getYaxisColor = function() {
        return this.yAxisColor;
    }

    Helper.prototype.getXaxisVisibility = function() {
        return this.showXaxis ? 'visible' : 'hidden';
    }

    Helper.prototype.getYaxisVisibility = function() {
        return this.showYaxis ? 'visible' : 'hidden';
    }

    Helper.prototype.getXaxisLabelVisibility = function() {
        return this.showXaxisLabel ? 'visible' : 'hidden';
    }

    Helper.prototype.getYaxisLabelVisibility = function() {
        return this.showYaxisLabel ? 'visible' : 'hidden';   
    }

    Helper.prototype.setAxisColor = function() {
        var xTicks = d3.selectAll('#x_axis .tick'),
            yTicks = d3.selectAll('#y_axis .tick');

        d3.select('#x_axis path')
            .style('stroke', this.xAxisColor);

        xTicks.select('line')
            .style('stroke', this.xAxisColor);

        d3.select('.tick-labels').selectAll('text')
            .style('fill', this.xAxisColor);

        d3.select('#y_axis path')
            .style('stroke', this.yAxisColor);

        yTicks.select('line')
            .style('stroke', this.yAxisColor);

        yTicks.select('text')
            .style('fill', this.yAxisColor);
    }

    Helper.prototype.getGlobalMinMax = function(data) {
        var allValues = [],
            min,
            max;

        data.forEach(function(d) {
            MES.forEach(function(m) {
                allValues.push(d[m] || 0);
            })
        });

        min = Math.min.apply(Math, allValues);
        max = Math.max.apply(Math, allValues);

        min = min > 0 ? 0 : min

        return [min, max];
    }

    Helper.prototype.truncateLabel = function(element, label, containerLength) {
        return label;
        var truncLabel = label;

        var arr = label.split('');

        if((containerLength - offsetX) < element.getComputedTextLength()) {
            var charLength = parseInt((containerLength - offsetX) * element.getNumberOfChars()/element.getComputedTextLength()) - 3;
            truncLabel = arr.splice(0, charLength).join('') + '...';    
        }

        return truncLabel;
    }

    Helper.prototype.getXLabels = function(data) {
        return data.map(function(d) { return d[DIM]; })
    }

    Helper.prototype.getDimDisplayName = function() {
        return this.displayName;
    }

    Helper.prototype.getMesDisplayName = function() {
        return this.measureProp.map(function(p) { return p.displayName; }).join(', ');
    }

    Helper.prototype.getValueNumberFormat = function(data, index) {
        var si = this.measureProp[index]['numberFormat'];
        return d3.formatPrefix('.2s', numberFormat[si]);
    }

    Helper.prototype.getDisplayColor = function(data, index) {
        return this.measureProp[index]['displayColor'] || DEFAULT_COLOR;
    }

    Helper.prototype.getBorderColor = function(data, index) {
        return this.measureProp[index]['borderColor'] || DEFAULT_COLOR;
    }

    Helper.prototype.getValueColor = function(data, index) {
        return this.measureProp[index]['textColor'] || DEFAULT_COLOR;
    }

    Helper.prototype.getValueVisibility = function(data, index) {
        var isVisible = this.measureProp[index]['showValues'];
            
        if(isVisible) {
            return 'visible';
        }

        return 'hidden';
    }

    Helper.prototype.getValueFontStyle = function(data, index) {
        return this.measureProp[index]['fontStyle'];
    }

    Helper.prototype.getValueFontWeight = function(data, index) {
        return this.measureProp[index]['fontWeight'];   
    }

    Helper.prototype.getLineType = function(data, index) {
        return this.measureProp[index]['lineType'] == "area" ? "visible" : "hidden";
    }

    Helper.prototype.toggleTooltip = function(visibility) {
        return function(d, i) {
            if(visibility == 'visible')
                tooltip.html((function() {
                    var nf = helper.getValueNumberFormat(d, d['index']);
                    return '<p><strong>' + d['data'][DIM] + '</<strong></p>'
                        + '<p><strong>' + MES[d['index']] + ': ' + nf(d['data'][MES[d['index']]]) + '</<strong></p>';
                })());

            var offset = $('svg').offset();
            var x = d3.event.pageX - offset.left,
                y = d3.event.pageY - offset.top;

            tooltip.style('top', y + 'px').style('left', x + 'px');
            tooltip.style('visibility', visibility);
        };
    }

    Helper.prototype.isLegendVisible = function() {
        return this.showLegend;
    }

    Helper.prototype.getLegendPosition = function() {
        return this.legendPosition;
    }

    return Helper;

})();


function lineChart(params) {
    console.log(params)
    var me = this;

    var containerId = params.containerId,
        tooltipId = params.tooltipId,
        data = params.data,
        config = params.config;

    var DIM = params.dimension,
        MES = params.measure;

    var width = 1260,
        height = 540;

    helper = me.helper = new Helper(config);
    helper.setDimension(DIM);
    helper.setMeasure(MES);

    var parentDiv = d3.select(document.body)
        .append('div')
        .style('position', 'relative');

    var svg = parentDiv.append('svg')
        .attr('width', width)
        .attr('height', height);

    tooltip = parentDiv.append('tooltip')
        .attr('class', 'hidden');

    var globalMin,
        globalMax,
        xLabels;

    [globalMin, globalMax] = helper.getGlobalMinMax(data);
    xLabels = helper.getXLabels(data);

    var padding = helper.getPadding(),
        margin = helper.getMargin();

    var containerWidth = width - 2 * padding,
        containerHeight = height - 2 * padding;

    var container = svg.append('g')
        .attr('transform', 'translate(' + padding + ', ' + padding + ')');

    var legend = container.append('g')
        .attr('class', 'legend')
        .attr('display', function() {
            if(helper.isLegendVisible()) {
                return 'block';
            }
            return 'none';
        })
        .selectAll('.item')
        .data(MES)
        .enter().append('g')
            .attr('class', 'item')
            .attr('id', function(d, i) {
                return 'legend' + i;
            })
            .attr('transform', function(d, i) {
                if(helper.getLegendPosition() == 'top') {
                    return 'translate(' + i * Math.floor(containerWidth/MES.length) + ', 0)';
                } else if(helper.getLegendPosition() == 'bottom') {
                    return 'translate(' + i * Math.floor(containerWidth/MES.length) + ', ' + containerHeight + ')';
                } else if(helper.getLegendPosition() == 'left') {
                    return 'translate(0, ' + i * 20 + ')';
                } else if(helper.getLegendPosition() == 'right') {
                    return 'translate(' + (4 * containerWidth/5) + ', ' + i * 20 + ')';
                }
            });

    legend.append('rect')
        .attr('x', 4)
        .attr('width', 10)
        .attr('height', 10)
        .style('fill', function(d, i) {
            return helper.getDisplayColor(d, i);
        });

    legend.append('text')
        .attr('x', 18)
        .attr('y', 5)
        .attr('dy', function(d) {
            return d3.select(this).style('font-size').replace('px', '')/2.5;
        })
        .text(function(d) { return d; })
        .text(function(d) {
            if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
                return helper.truncateLabel(this, d, Math.floor(containerWidth/MES.length) - 20);

            } else if((helper.getLegendPosition() == 'left') || (helper.getLegendPosition() == 'right')) {
                return helper.truncateLabel(this, d, containerWidth/5);

            }
        });

    if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
        legend.attr('transform', function(d, i) {
            var count = i,
                widthSum = 0
            while(count-- != 0) {
                widthSum += d3.select('#legend' + count).node().getBBox().width + offsetX;
            }
            return 'translate(' + widthSum + ', ' + (helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
        });
    }

    var contentWidth,
        contentHeight;

    if(!helper.isLegendVisible()) {
        legendSpace = 0;
        contentWidth = containerWidth - margin.left;
        contentHeight = containerHeight - 2 * axisLabelSpace;
    } else {
        if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
            contentWidth = containerWidth - margin.left;
            contentHeight = containerHeight - 3 * axisLabelSpace;
            legendSpace = 20;
        } else if((helper.getLegendPosition() == 'left') || (helper.getLegendPosition() == 'right')) {
            contentWidth = (4 * containerWidth/5) - margin.left;
            contentHeight = containerHeight - 2 * axisLabelSpace;
            legendSpace = containerWidth/5;
        }
    }

    var chart = container.append('g')
        .attr('transform', function() {
            if(helper.getLegendPosition() == 'top') {
                return 'translate(' + margin.left + ', ' + legendSpace + ')';
            } else if(helper.getLegendPosition() == 'bottom') {
                return 'translate(' + margin.left + ', 0)';
            } else if(helper.getLegendPosition() == 'left') {
                return 'translate(' + (legendSpace + margin.left) + ', 0)';
            } else if(helper.getLegendPosition() == 'right') {
                return 'translate(' + margin.left + ', 0)';
            }
        });

    var xScale = d3.scalePoint()
        .domain(xLabels)
        .rangeRound([0, contentWidth])
        .padding([0.2]);

    var yScale = d3.scaleLinear()
        .domain([globalMin, globalMax])
        .range([contentHeight, 0]);

    var _yTicks = yScale.ticks(),
        yDiff = _yTicks[1] - _yTicks[0];

    if((_yTicks[_yTicks.length - 1] + yDiff) > globalMax + 15) {
        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + yDiff)])
    } else {
        yScale.domain([globalMin, (_yTicks[_yTicks.length - 1] + 2 * yDiff)])
    }

    var content = chart.append('g')
        .attr('class', 'chart')

    var xGridLines = d3.axisBottom()
        .tickFormat('')
        .tickSize(-contentHeight)
        .scale(xScale);

    var yGridLines = d3.axisLeft()
        .tickFormat('')
        .tickSize(-contentWidth)
        .scale(yScale);

    content.append('g')
        .attr('class', 'grid')
        .attr('visibility', helper.getGridVisibility())
        .attr('transform', 'translate(0, ' + contentHeight + ')')
        .call(xGridLines);

    content.append('g')
        .attr('class', 'grid')
        .attr('visibility', helper.getGridVisibility())
        .call(yGridLines);

    var areaGenerator = d3.area()
        .curve(d3.curveCardinal)
        .x(function(d, i) {
            return xScale(d['data'][DIM]);
        })
        .y0(contentHeight)
        .y1(function(d) {
            return yScale(d['data'][MES[d['index']]]);
        });

    var lineGenerator = d3.line()
        .curve(d3.curveCardinal)
        .x(function(d, i) {
            return xScale(d['data'][DIM]);
        })
        .y(function(d, i) {
            return yScale(d['data'][MES[d['index']]]);
        });

    var cluster = content.selectAll('.cluster')
        .data(MES)
        .enter().append('g')
            .attr('class', 'cluster');

    var area = cluster.append('path')
        .datum(function(d, i) {
            return data.map(function(d) { return { "index": i, "data": d }; });
        })
        .attr('class', 'area')
        .attr('visibility', function(d, i) {
            return helper.getLineType(d, i);
        })
        .attr('fill', function(d, i) {
            return helper.getDisplayColor(d, i);
        })
        .style('fill-opacity', 0.5)
        .attr('stroke', 'none')
        .attr('d', areaGenerator);

    var line = cluster.append('path')
        .datum(function(d, i) {
            return data.map(function(d) { return { "index": i, "data": d }; });
        })
        .attr('class', 'line')
        .attr('fill', 'none')
        .attr('stroke', function(d, i) {
            return helper.getBorderColor(d, i);
        })
        .attr('stroke-linejoin', 'round')
        .attr('stroke-linecap', 'round')
        .attr('stroke-width', 1)
        .attr('d', lineGenerator);

    // Add the points!
    var point = cluster.selectAll('point')
        .data(function(d, i) {
            return data.map(function(d) { return { "index": i, "data": d}; });
        })
        .enter().append('path')
            .attr('class', 'point')
            .attr('d', d3.symbol().type(d3.symbolCross).size(40))
            .attr('transform', function(d) {
                return 'translate(' + xScale(d['data'][DIM]) + ',' + yScale(d['data'][MES[d['index']]]) + ')';
            })
            .on('mouseover', helper.toggleTooltip('visible'))
            .on('mousemove', function() {
                var offset = $('svg').offset();
                var x = d3.event.pageX - offset.left,
                    y = d3.event.pageY - offset.top;
    
                tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
            })
            .on('mouseout', helper.toggleTooltip('hidden'));

    var text = cluster.selectAll('text')
        .data(function(d, i) {
            return data.map(function(d) { return { "index": i, "data": d }; });
        })
        .enter().append('text')
            .attr('x', function(d, i) {
                return xScale(d['data'][DIM]);
            })
            .attr('y', function(d, i) {
                return yScale(d['data'][MES[d['index']]]);
            })
            .attr('dy', function(d, i) {
                return -2 * offsetY;
            })
            .style('text-anchor', 'middle')
            .text(function(d, i) {
                return helper.getValueNumberFormat(d, d['index'])(d['data'][MES[d['index']]]);
            })
            .attr('visibility', function(d, i) {
                return helper.getValueVisibility(d, d['index']);
            })
            .style('font-style', function(d, i) {
                return helper.getValueFontStyle(d, d['index']);
            })
            .style('font-weight', function(d, i) {
                return helper.getValueFontWeight(d, d['index']);
            })
            .style('fill', function(d, i) {
                return helper.getValueColor(d, d['index']);
            });

    var axisLeftG = chart.append('g')
        .attr('class', 'y axis')
        .attr('visibility', helper.getYaxisVisibility())
        .attr('transform', 'translate(0, 0)');

    axisLeftG.append('g')
        .attr('class', 'label')
        .attr('transform', function() {
            return 'translate(' + (-margin.left) + ', ' + (contentHeight/2) + ')';
        })
        .append('text')
            .attr('transform', 'rotate(-90)')
            .style('fill', function() {
                return helper.getYaxisColor();
            })
            .style('visibility', helper.getYaxisLabelVisibility())
            .text(function() {
                return helper.getMesDisplayName();
            });

    var axisBottomG = chart.append('g')
        .attr('class', 'x axis')
        .attr('visibility', helper.getXaxisVisibility())
        .attr('transform', 'translate(0, ' + contentHeight + ')');

    axisBottomG.append('g')
        .attr('class', 'label')
        .attr('transform', 'translate(' + (contentWidth/2) + ', ' + 2 * axisLabelSpace + ')')
        .append('text')
            .style('font-size', 10)
            .style('text-anchor', 'middle')
            .style('fill', function() {
                return helper.getXaxisColor();
            })
            .style('visibility', helper.getXaxisLabelVisibility())
            .text(function() {
                return helper.getDimDisplayName();
            });

    var axisBottom = d3.axisBottom(xScale)
    axisBottomG.append('g')
        .attr('id', 'x_axis')
        .call(axisBottom);

    var axisLeft = d3.axisLeft(yScale)
    axisLeftG.append('g')
        .attr('id', 'y_axis')
        .call(axisLeft);

    helper.setAxisColor();

    var _div = parentDiv.node().outerHTML;
    parentDiv.remove();

    return _div;
}

module.exports = lineChart;