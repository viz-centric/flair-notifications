
function parseIntFontSize(fontSize) {
    if (/px/.test(fontSize)) {
      return parseInt(fontSize, 10);
    }
    return /em/.test(fontSize) ? parseFloat(fontSize) * 12 : 12;
  }

function getBBox() {
    const elem = this;
    let lineWidth = 0;
    let width = 0;
    let height = 0;
  
    function expandSizeByChild(child) {
      const fontSize = parseIntFontSize(child.style.fontSize || elem.style.fontSize);
  
      // The font size and lineHeight is based on empirical values, copied from
      // the SVGRenderer.fontMetrics function in Highcharts.
      const lineHeight = fontSize < 24 ? fontSize + 3 : Math.round(fontSize * 1.2);
      const textLength = child.textContent.length * fontSize *  0.55;
  
      // Tspans on the same line
      if (child.getAttribute('dx') !== '0') {
        height += lineHeight;
      }
  
      // New line
      if (child.getAttribute('dy') !== null) {
        lineWidth = 0;
      }
  
      lineWidth += textLength;
      width = Math.max(width, lineWidth);
    }
  
    [].forEach.call(elem.children.length ? elem.children : [elem], expandSizeByChild);
  
    return { x: 0, y: 0, width, height };
  }

function createSVGRect() {}

module.exports.configureDomForcharts = function (doc) {

    const oldCreateElementNS = doc.createElementNS;
            // eslint-disable-next-line no-param-reassign
            doc.createElementNS = function createElementNS(ns, tagName) {
              const elem = oldCreateElementNS.call(this, ns, tagName);
              if (ns === 'http://www.w3.org/2000/svg') {
                elem.createSVGRect = createSVGRect;
                elem.getBBox = getBBox;
              }
              return elem;
            };
};