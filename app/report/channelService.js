const jobs = require('./../jobs/channelJobs');
const validator = require('./../validator');
const logger = require('./../logger');

module.exports = {
    getChannelProperties, getChannelProperties,
    getChannel: getChannel,
    getChannelByChannelName: getChannelByChannelName,
    updateChannel: updateChannel,
    addChannelConfigs: addChannelConfigs,
    deleteChannelConfig: deleteChannelConfig
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
 * get Channel Properties
 * @param channel
 * @return {Promise<any>}
 */
function getChannelProperties(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Get channel config for ${request.channel}`);
        jobs.getChannelProperties().then(function (result) {
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
 * update channel details by channel name
 * @param channel
 * @return {Promise<any>}
 */
function updateChannel(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Update channel with param`, request.report);

        jobs.updateChannel(request).then(function (result) {
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
            jobs.getChannelByChannelName(request.channel).then(function (result) {
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

    });
}

/**
 * add new channel
 * @param
 * @return {Promise<any>}
 */
function addChannelConfigs(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`add channel with param`, request);
        if (request) {
            jobs.addChannelConfigs(request).then(function (result) {
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
function deleteChannelConfig(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`add channel with param`, request);
        if (request) {
            jobs.deleteChannelConfig(request.id).then(function (result) {
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