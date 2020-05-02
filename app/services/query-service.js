const logger = require('./../logger');
const moment = require('moment');

function preProcessQuery(query) {
  logger.info(`Pre-processing query ${query}`);
  const stringQuery = JSON.stringify(query);
  const result = stringQuery.split('__FLAIR_NOW()')
    .join("__FLAIR_CAST(timestamp, '" + moment().utc().format('YYYY-MM-DD HH:mm:ss') + ".000000')");
  logger.info(`Pre-processing query result ${result}`);
  return JSON.parse(result);
}

module.exports = {
  preProcessQuery,
};
