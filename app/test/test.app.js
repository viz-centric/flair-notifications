const app = require('../app');
const AppConfig = require('../load_config');

let port = 4200 //AppConfig.httpPort;
app.listen(port);
console.log(`Server started! At http://localhost:${port}`);
module.exports = app;