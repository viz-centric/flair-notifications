const AppConfig = require('./load_config');
const restartJobModule = require('./restart-jobs');
const logger = require('./logger');
const grpc = require('./grpc');
const http = require('./http');
const discovery = require('./discovery');

async function init(config) {
  let httpPort = config.httpPort;
  let grpcPort = config.grpcPort;
  let sslConfig = config.ssl;

  logger.log({
    level: 'info',
    message: 'Server started!',
    httpPort,
    grpcPort,
    sslConfig
  });

  http.start(httpPort);
  await grpc.start(grpcPort, sslConfig);

  restartJobModule.restartJobs();
}

async function start() {
  const config = await AppConfig.getConfig();
  await discovery.start();
  await init(config);
}

start();
