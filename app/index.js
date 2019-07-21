const AppConfig = require('./load_config');
const restartJobModule = require('./restart-jobs');
const logger = require('./logger');
const grpc = require('./grpc');
const http = require('./http');
const discovery = require('./discovery');

let httpPort = AppConfig.httpPort;
let grpcPort = AppConfig.grpcPort;
let sslConfig = AppConfig.ssl;
let mode = AppConfig.mode;

if (mode === 'grpc') {
  grpc.start(grpcPort, sslConfig);
}

http.start(httpPort);

logger.log({
  level: 'info',
  message: 'Server started!',
  httpPort,
  grpcPort,
  mode,
  sslConfig
});

restartJobModule.restartJobs();

discovery.start();