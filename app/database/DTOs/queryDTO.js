function queryDTO(queryObj){
      return{	
            fields:queryObj.fields,
            groupBy:queryObj.groupBy,
            limit:queryObj.limit,
            queryId:queryObj.queryId,
            source:queryObj.source,
            querySource:queryObj.querySource,
            sourceId:queryObj.sourceId,
            userId:queryObj.userId,
            conditionExpressions:queryObj.conditionExpressions,
            having:queryObj.having
      }
}

module.exports = queryDTO;
