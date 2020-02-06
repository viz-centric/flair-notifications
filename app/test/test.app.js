const app = require('../app');
const AppConfig = require('../load_config');

let port = AppConfig.httpPort;
app.listen(port);
console.log(`Server started! At http://localhost:${port}`);
module.exports = app;