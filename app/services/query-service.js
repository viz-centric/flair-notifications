const logger = require('./../logger');

function preProcessQuery(query) {
  logger.info(`Pre-processing query ${query}`);
  const stringQuery = JSON.stringify(query);
  const result = stringQuery.split('__FLAIR_NOW()')
    .join("__FLAIR_CAST(timestamp, '" + new Date().toISOString() + "')");
  logger.info(`Pre-processing query result ${result}`);
  return JSON.parse(result);
}

module.exports = {
  preProcessQuery,
};
