var app = require('./app');

module.exports = {
    start: startServer
}

function startServer(port) {
    app.listen(port);
}

