const AppConfig = require('./load_config');
const restartJobModule = require('./restart-jobs');
const logger = require('./logger');
const grpc = require('./grpc');
const http = require('./http');
const discovery = require('./discovery');

function init() {
  let httpPort = AppConfig.getConfig().httpPort;
  let grpcPort = AppConfig.getConfig().grpcPort;
  let sslConfig = AppConfig.getConfig().ssl;

  logger.log({
    level: 'info',
    message: 'Server started!',
    httpPort,
    grpcPort,
    sslConfig
  });

  http.start(httpPort);
  grpc.start(grpcPort, sslConfig);

  restartJobModule.restartJobs();
}

async function start() {
  await AppConfig.loadConfig();
  await discovery.start();
  init();
}

start();
