const jwt = require('jsonwebtoken');
const AppConfig = require("./load_config");

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

module.exports = {
    decodeAuth
}