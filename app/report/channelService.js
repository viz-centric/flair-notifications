const jobs = require('./../jobs/channelJobs');
const validator = require('./../validator');
const logger = require('./../logger');

module.exports = {
    getChannelProperties, getChannelProperties,
    getTeamConfig: getTeamConfig,
    getEmailConfig: getEmailConfig,
    updateTeamWebhookURL: updateTeamWebhookURL,
    updateEmailSMTP: updateEmailSMTP,
    addTeamConfigs: addTeamConfigs,
    addEmailConfigs: addEmailConfigs,
    deleteWebhookURL: deleteWebhookURL
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
                resolve(result);
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
function updateTeamWebhookURL(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Update channel with param`, request.report);

        jobs.updateTeamWebhookURL(request).then(function (result) {
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
 * @param update email smtp
 * @return {Promise<any>}
 */
function updateEmailSMTP(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Update channel with param`, request.report);

        jobs.updateEmailSMTP(request).then(function (result) {
            if (result.success === 1) {
                resolve(result);
            } else {
                reject({ message: result.message });
            }
        }, function (err) {
            reject({ message: err });
        })

    });
}

/**
 * get team webhook URL list
 * @param
 * @return {Promise<any>}
 */
function getTeamConfig(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`get team webhook URL list`);
        jobs.getTeamConfig().then(function (result) {
            if (result.success === 1) {
                resolve(result);
            } else {
                reject({ message: result.message });
            }
        }, function (err) {
            reject({ message: err });
        })

    });
}

/**
 * get SMTP config
 * @param
 * @return {Promise<any>}
 */
function getEmailConfig(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`get SMTP config`);
        jobs.getEmailConfig().then(function (result) {
            if (result.success === 1) {
                resolve(result);
            } else {
                reject({ message: result.message });
            }
        }, function (err) {
            reject({ message: err });
        })

    });
}

/**
 * add new team channel
 * @param
 * @return {Promise<any>}
 */
function addTeamConfigs(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`add channel with param`, request);
        if (request) {
            jobs.addTeamConfigs(request).then(function (result) {
                if (result.success === 1) {
                    resolve({ message: result.message });
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
 * add new team channel
 * @param
 * @return {Promise<any>}
 */
function addEmailConfigs(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`add channel email with param`, request);
        if (request) {
            jobs.addEmailConfigs(request).then(function (result) {
                if (result.success === 1) {
                    resolve({ message: result.message });
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
function deleteWebhookURL(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`deleteing webhook URL`, request);
        if (request) {
            jobs.deleteWebhookURL(request.id).then(function (result) {
                if (result.success === 1) {
                    resolve({message: result.message});
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject({ message: err });
            })
        }
    });
}