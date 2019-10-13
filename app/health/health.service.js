const logger = require('./../logger');

module.exports = {
  watch,
  check
};

function check(request) {
  return new Promise(function (resolve) {
    logger.info(`Health check`, request.service);
    resolve({status: 'SERVING'});
  });
}

function watch(request) {
  return new Promise(function (resolve) {
    logger.info(`Health watch`, request.service);
    resolve({status: 'SERVING'});
  });
}
