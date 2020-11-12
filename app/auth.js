const jwt = require('jsonwebtoken');
const grpc = require("grpc");
const AppConfig = require("./load_config");
const logger = require('./logger');

async function decodeAuth(bearerHeader) {
    const config = await AppConfig.getConfig();
    return new Promise(function(resolve, reject) {
        let bearerToken;

        if (typeof bearerHeader !== 'undefined') {

            let bearer = bearerHeader.split(" ");
            bearerToken = bearer[1];

            jwt.verify(bearerToken, config.grpc.auth.jwtKey, function(err, decoded) {
                if (err) {
                    reject(err)
                }
                resolve(decoded);
            });
        } else {
            reject("No authorization bearer token was found or the token was formatted improperly.");
        }
    });
}

async function encodeJwt(subject) {
    const config = await AppConfig.getConfig();

    logger.info(`Creating jwt token for subject ${subject}`);

    const token = jwt.sign(
        {auth: 'ROLE_USER'},
        config.auth.jwtKey,
        {algorithm: "HS256", subject: subject}
    );

    return {token};
}

async function encodeGrpcJwt(subject) {
    const config = await AppConfig.getConfig();

    logger.info(`Creating grpc jwt token for subject ${subject}`);

    const token = jwt.sign(
        {},
        config.grpc.auth.jwtKey,
        {algorithm: "HS256", subject: subject}
    );

    const metadata = new grpc.Metadata();
    metadata.add('Authorization', 'Bearer ' + token);
    return metadata;
}

module.exports = {
    decodeAuth,
    encodeGrpcJwt,
    encodeJwt
}