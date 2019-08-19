const AppConfig = require('./load_config');
const restartJobModule = require('./restart-jobs');
const logger = require('./logger');
const grpc = require('./grpc');
const http = require('./http');
const discovery = require('./discovery');
const envService = require('./services/env.service');

let httpPort = AppConfig.httpPort;
let grpcPort = AppConfig.grpcPort;
let sslConfig = AppConfig.ssl;

http.start(httpPort);

logger.log({
  level: 'info',
  message: 'Server started!',
  httpPort,
  grpcPort,
  sslConfig
});

restartJobModule.restartJobs();

function init() {
  grpc.start(grpcPort, sslConfig);
  discovery.start();
}

envService.init()
  .then(() => {
    init();
  });

