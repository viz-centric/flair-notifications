function reprtlineitemDTO(reportLineItemObj){
    return {
        visualizationid:reportLineItemObj.visualizationid,	
        dimension:reportLineItemObj.dimension,
        measure:reportLineItemObj.measure, 
        visualization:reportLineItemObj.viz_type,
      }
  }

module.exports = reprtlineitemDTO;