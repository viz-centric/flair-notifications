const jobs = require('./../jobs');
const validator = require('./../validator');
const logger = require('./../logger');


module.exports = {
    addChannel: addChannel,
    getChannel: getChannel,
    getChannelByChannelName: getChannelByChannelName,
    updateChannelByChannelName: updateChannelByChannelName
};

/**
 * message as a response for operations
 * @param message
 * @constructor
 */
function Message(message) {
    this.message = message;
}

/**
 * update channel details by channel name
 * @param channel
 * @return {Promise<any>}
 */
function updateChannelByChannelName(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Update channel with param`, request.report);

        jobs.updateChannelByChannelName(request).then(function (result) {
            if (result.success === 1) {
                resolve({});
            } else {
                reject({ message: result.message });
            }
        }, function (err) {
            reject({ message: err });
        })

    });
}


/**
 * get Channel By Channel Name
 * @param channel
 * @return {Promise<any>}
 */
function getChannelByChannelName(request) {
    return new Promise(function (resolve, reject) {
        if (request.channel) {
            logger.info(`Get channel config for ${request.channel}`);
            jobs.updateChannelByChannelName(request).then(function (result) {
                if (result.success === 1) {
                    resolve({});
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject({ message: err });
            })

        }
    });
}

/**
 * get Channel list
 * @param
 * @return {Promise<any>}
 */
function getChannel(request) {
    return new Promise(function (resolve, reject) {
        if (request.channel) {
            logger.info(`Get channel list`);
            jobs.getChannel().then(function (result) {
                if (result.success === 1) {
                    resolve({});
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject({ message: err });
            })

        }
    });
}



/**
 * add new channel
 * @param
 * @return {Promise<any>}
 */
function addChannel(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`add channel with param`, request);

        if (request) {
            jobs.addChannel(request).then(function (result) {
                if (result.success === 1) {
                    resolve({});
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject({ message: err });
            })
        }
    });
}

