var AppConfig = require('./load_config');
var restartJobModule = require('./restart-jobs')
var logger = require('./logger')

var port = AppConfig.port;


if (AppConfig.mode === 'grpc') {
  require('./grpc').start(port);
} else {
  require('./http').start(port);
}
logger.log({
  level: 'info',
  message: 'Server started!',
  port: port,
  mode: AppConfig.mode
});
restartJobModule.restartJobs();
