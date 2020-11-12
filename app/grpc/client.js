const grpc = require("grpc");
const auth = require("../auth");
const protoLoader = require("@grpc/proto-loader");
const discovery = require('../discovery');
const logger = require('../logger');
const PROTO_PATH = './app/grpc/QueryService.proto';
const AppConfig = require('../load_config');

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

async function getRecords(query, meta) {
  logger.info(`Get records for query ${query}`);
  let client = grpcClientInstance;

  const grpcMetadata = await generateGrpcMetadata(meta.userName);

  return new Promise((resolve, reject) => {
    logger.info(`Get records promise`, query);
    client.GetData(query, grpcMetadata, (error, response) => {
      
      if (!error) {
        resolve(response);
      } else {
        reject(error.message);
        logger.error(`Get records error`, error);
      }
    });
  });
}

const grpcClient = {
  getRecords
};

async function init() {
  logger.info(`Creating grpc client`);

  let url = await discovery.getAppDomain('FLAIR-ENGINE-GRPC');

  if (process.env.FLAIR_ENGINE) {
    url = process.env.FLAIR_ENGINE;
    logger.debug(`Flair engine instance url is picked up from the env variable ${url}`);
  }

  logger.debug(`Flair engine instance ${url}`);
  let channelCredentials = grpc.credentials.createInsecure();
  // let callCredentials = grpc.credentials.createFromMetadataGenerator((args, callback) => {
  //   callback(null, metadata);
  // });
  // const creds = grpc.credentials.combineChannelCredentials(
  //     channelCredentials,
  //     callCredentials,
  // )

  grpcClientInstance = new queryproto.messages.QueryService(url, channelCredentials);

}

async function generateGrpcMetadata(userName) {
  const config = await AppConfig.getConfig();
  const subject = userName || config.grpc.auth.username;

  return await auth.encodeGrpcJwt(subject);
}

init();

module.exports = grpcClient;
