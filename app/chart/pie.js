const d3 = require('d3');
const jsdom = require('jsdom');
const { JSDOM } = jsdom;

const { document } = (new JSDOM('')).window;
global.document = document;

var originalData = [],
    helper;

var legendSpace = 20,
    offset = 20;

var offsetX = 16, 
    offsetY = 5;

var tooltip;

var Helper = (function() {

    var DIM, MES;

    var numberFormat = {
        "K": "1e3",
        "M": "1e6",
        "B": "1e9",
    };

    function Helper(config) {
        this.config = config;
        this.dimDisplayName = config.dimDisplayName;
        this.mesDisplayName = config.mesDisplayName;
        this.showLegend = config.showLegend;
        this.legendPosition = config.legendPosition;
        this.chartType = config.chartType;
        this.showValueAs = config.showValueAs;
        this.valueAsArc = config.valueAsArc;
        this.valuePosition = config.valuePosition;
        this.total = 0;
    }

    Helper.prototype.setDimension = function(dimension) {
        DIM = dimension;
    }

    Helper.prototype.setMeasure = function(measure) {
        MES = measure;
    }

    Helper.prototype.getPadding = function() {
        return 20;
    }

    Helper.prototype.getDimDisplayName = function() {
        return this.dimDisplayName;
    }

    Helper.prototype.getMesDisplayName = function() {
        return this.mesDisplayName;
    }

    Helper.prototype.getChartType = function() {
        return this.chartType;
    }

    Helper.prototype.getShowValueAs = function() {
        return this.showValueAs;
    }

    Helper.prototype.isArcRepresentation = function() {
        return this.valueAsArc;
    }

    Helper.prototype.getValuePosition = function() {
        return this.valuePosition;
    }

    Helper.prototype.setTotal = function(val) {
        this.total = val;
    }

    Helper.prototype.getTotal = function() {
        return this.total;
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

    Helper.prototype.getLabel = function(scope) {
        return function(d, i) {
            if(scope.helper.getShowValueAs() == "label") {
                return d.data[DIM[0]];
            } else if(scope.helper.getShowValueAs() == "value") {
                return d.data[MES[0]];
            } else if(scope.helper.getShowValueAs() == "percentage") {
                return (100 * d.data[MES[0]] / scope.helper.getTotal()).toFixed(2) + "%";
            }
        }
    }

    Helper.prototype.toggleTooltip = function(visibility) {
        return function(d, i) {
            if(visibility == 'visible')
                tooltip.html((function() {
                    return '<p><strong>' + d.data[DIM[0]] + '</<strong></p>'
                        + '<p><strong>' + MES[0] + ': ' + d.data[MES[0]] + '</<strong></p>';
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

function pieChart(params) {
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

    var colorScale = d3.scaleOrdinal()
        .range(d3.schemeCategory10);

    helper.setTotal(d3.sum(data.map(function(d) { return d[MES[0]]; })));

    var padding = helper.getPadding();

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
        .data(data)
        .enter().append('g')
            .attr('class', 'item')
            .attr('id', function(d, i) {
                return 'legend' + i;
            })
            .attr('transform', function(d, i) {
                if(helper.getLegendPosition() == 'top') {
                    return 'translate(' + i * Math.floor(containerWidth/data.length) + ', 0)';
                } else if(helper.getLegendPosition() == 'bottom') {
                    return 'translate(' + i * Math.floor(containerWidth/data.length) + ', ' + containerHeight + ')';
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
            return colorScale(d[DIM]);
        });

    legend.append('text')
        .attr('x', 18)
        .attr('y', 5)
        .attr('dy', function(d) {
            return d3.select(this).style('font-size').replace('px', '')/2.5;
        })
        .text(function(d) { return d[DIM]; })
        .text(function(d) {
            if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
                return helper.truncateLabel(this, d[DIM], Math.floor(containerWidth/data.length) - 20);
            } else if((helper.getLegendPosition() == 'left') || (helper.getLegendPosition() == 'right')) {
                return helper.truncateLabel(this, d[DIM], containerWidth/5);
            }
        });

    if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
        /*legend.attr('transform', function(d, i) {
            var count = i,
                widthSum = 0
            while(count-- != 0) {
                widthSum += d3.select('#legend' + count).node().getBBox().width + offsetX;
            }
            return 'translate(' + widthSum + ', ' + (helper.getLegendPosition() == 'top' ? 0 : containerHeight) + ')';
        });*/
    }

    var contentWidth = containerWidth,
        contentHeight = containerHeight;

    if(!helper.isLegendVisible()) {
        legendSpace = 0;
    } else {
        if((helper.getLegendPosition() == 'top') || (helper.getLegendPosition() == 'bottom')) {
            legendSpace = 20;
        } else if((helper.getLegendPosition() == 'left') || (helper.getLegendPosition() == 'right')) {
            contentWidth = (4 * containerWidth/5);
            legendSpace = containerWidth/5;
        }
    }

    var radius = Math.min(contentWidth, contentHeight) / 2,
        outerRadius = radius - offset,
        innerRadius = Math.floor((radius - offset) * 0.7);

    var arc = d3.arc()
        .outerRadius(outerRadius);

    if(helper.getChartType() == 'donut') {
        arc.innerRadius(innerRadius);
    } else {
        arc.innerRadius(0);
    }

    var labelArc = d3.arc()
        .outerRadius(radius - 2 * offset)
        .innerRadius(Math.floor((radius - 2 * offset) * 0.8));

    var pie = d3.pie()
        .sort(null)
        .value(function(d) { return d[MES[0]]; });

    var chart = container.append('g')
        .attr('transform', function() {
            if(helper.getLegendPosition() == 'top') {
                return 'translate(' + (contentWidth/2) + ', ' + (legendSpace + contentHeight/2) + ')';
            } else if(helper.getLegendPosition() == 'bottom') {
                return 'translate(' + (contentWidth/2) + ', ' + (contentHeight/2) + ')';
            } else if(helper.getLegendPosition() == 'left') {
                return 'translate(' + (legendSpace + contentWidth/2) + ', ' + contentHeight/2 + ')';
            } else if(helper.getLegendPosition() == 'right') {
                return 'translate(' + contentWidth/2 + ', ' + contentHeight/2 + ')';
            }
        });

    var gArc = chart.selectAll('.arc')
        .data(pie(data))
        .enter().append('g')
            .attr('class', 'arc');

    var pathArea = gArc.append('path')
        .attr('id', function(d, i) {
            return 'arc' + i;
        })
        .attr('d', arc)
        .style('fill', function(d) {
            return colorScale(d.data[DIM]);
        })
        .on('mouseover', helper.toggleTooltip('visible'))
        .on('mousemove', function() {
            var offset = $('svg').offset();
            var x = d3.event.pageX - offset.left,
                y = d3.event.pageY - offset.top;

            tooltip.style('top', y + 10 + 'px').style('left', x + 10 + 'px');
        })
        .on('mouseout', helper.toggleTooltip('hidden'));

    var label;

    if(helper.isArcRepresentation()) {
        label = gArc.append('text')
            .attr('dy', function(d, i) {
                if(helper.getValuePosition() == "inside") {
                    return 3 * offsetY;
                } else {
                    return -offsetY;
                }
            })
            .append('textPath')
                .attr('startOffset', function(d) {
                    var length = pathArea.nodes()[d.index].getTotalLength();
                    if(helper.getChartType() == 'donut') {
                        return (25 - (50 * outerRadius)/length + (50 * innerRadius)/length) + "%";
                    } else {
                        return 50 * (length - 2 * outerRadius)/length + "%";
                    }
                })
                .attr('xlink:href', function(d, i) {
                    return "#arc" + i;
                })
                .attr('text-anchor', function() {
                    if(helper.getChartType() == 'donut') {
                        return "start";
                    } else {
                        return "middle";
                    }
                })
                .text(helper.getLabel(me));
    } else {
        label = gArc.append('text')
            .attr('transform', function(d) {
                if(helper.getValuePosition() == "inside") {
                    return "translate(" + labelArc.centroid(d) + ")";
                } else {
                    var centroid = labelArc.centroid(d),
                        x = centroid[0],
                        y = centroid[1];

                    return "translate(" + x * 1.25 + ", " + y * 1.25 + ")";
                }
            })
            .attr('dy', '0.35em')
            .attr('text-anchor', function(d) {
                return (d.endAngle + d.startAngle)/2 > Math.PI ? "end" : "start";
            })
            .text(helper.getLabel(me));
    }

    var _div = parentDiv.node().outerHTML;
    parentDiv.remove();

    return _div;
}

module.exports = pieChart;