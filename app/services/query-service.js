const logger = require('./logger');

function preProcessQuery(query) {
  const result = query.split('$__FLAIR_NOW()').join(new Date().toString());
  logger.info(`Pre-processing query ${query} to ${result}`);
  return result;
}

module.exports = {
  preProcessQuery,
};
