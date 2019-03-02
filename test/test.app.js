
var app = require('../app');
var AppConfig = require('../load_config');

var port= AppConfig.port;  
app.listen(port);
console.log('Server started! At http://localhost:' + port);
module.exports= app;