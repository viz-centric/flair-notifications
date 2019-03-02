
var app = require('./app');
var AppConfig = require('./load_config');
var restartJobModule=require('./restart-jobs')

var port= AppConfig.port;  
var server= app.listen(port);
console.log('Server started! At http://localhost:' + port);

restartJobModule.restartJobs();