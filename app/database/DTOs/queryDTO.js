function queryDTO(queryObj){
        return{	
           fields:queryObj.fields,
           groupBy:queryObj.groupBy,
           limit:queryObj.limit,
           queryId:queryObj.queryId,
           source:queryObj.source,
           sourceId:queryObj.sourceId,
           userId:queryObj.userId
            }
      }

module.exports = queryDTO;