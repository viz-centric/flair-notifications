const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const discovery = require('../discovery');
const logger = require('../logger');
const PROTO_PATH = './app/grpc/QueryService.proto';

let grpcClientInstance;

const queryproto = grpc.loadPackageDefinition(
  protoLoader.loadSync(PROTO_PATH, {
    keepCase: true,
    longs: String,
    enums: String,
    defaults: true,
    oneofs: true
  })
);

const grpcClient = {
  getRecords: async function (query) {
    logger.info(`Get records for query ${query}`);
    let client = grpcClientInstance;
    logger.info(`Get records obtained client`, client);
    return new Promise((resolve, reject) => {
      logger.info(`Get records promise`, query);
      client.GetData(query, (error, response) => {
        logger.info(`Get records response ${JSON.stringify(query)} resp ${JSON.stringify(response)}`);
        if (!error) {
          resolve(response);
        } else {
          reject(error.message);
          logger.error(`Get records error`, error);
        }
      });
    });
  }
};

async function init() {
  logger.info(`Creating grpc client`);

  let url = await discovery.getAppDomain('FLAIR-ENGINE-GRPC');

  if (process.env.FLAIR_ENGINE) {
    url = process.env.FLAIR_ENGINE;
    logger.debug(`Flair engine instance url is picked up from the env variable ${url}`);
  }

  logger.debug(`Flair engine instance ${url}`);
  grpcClientInstance = new queryproto.messages.QueryService(url, grpc.credentials.createInsecure());

}

init();

module.exports = grpcClient;
