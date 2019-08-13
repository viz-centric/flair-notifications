var app = require('./api');
var AppConfig = require('./load_config');
var restartJobModule=require('./services/restart-jobs.service');
var logger=require('./logger')

var port= AppConfig.port;  
var server= app.listen(port);
logger.log({
    level: 'info',
    message: 'Server started!',
    port: port,
  });
restartJobModule.restartJobs();
