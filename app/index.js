var app = require('./app');
var AppConfig = require('./load_config');
var restartJobModule=require('./restart-jobs')
var logger=require('./logger')

var port= AppConfig.port;  
var server= app.listen(port);
logger.log({
    level: 'info',
    message: 'Server started!',
    port: port,
  });
restartJobModule.restartJobs();
