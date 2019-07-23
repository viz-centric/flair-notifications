const jobs = require('./../jobs');
const validator = require('./../validator');
const logger = require('./../logger');


module.exports = {
    getScheduledReport: getScheduledReport,
    scheduleReport: scheduleReport,
    getAllScheduledReportForUser: getAllScheduledReportForUser,
    getScheduledReportCountsForUser: getScheduledReportCountsForUser,
    getScheduledReportLogs: getScheduledReportLogs,
    updateScheduledReport: updateScheduledReport,
    deleteScheduledReport: deleteScheduledReport,
    executeReport: executeReport
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
 * Schedule a report.
 * @param request request
 * @returns {Promise<Message>}
 */
function scheduleReport(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Schedule report with param`, request.report);
        const result = validator.validateReportReqBody(request.report);
        if (result.error) {
            logger.log({
                level: 'error',
                message: 'error in schedule api due to invalid request body',
                errMsg: result.error.details[0].message
            });
            reject({message: result.error.details[0].message.replace(/"/g, "")});
        } else {
            jobs.createJob(request.report).then(function (result) {
                if (result.success === 1) {
                    resolve({});
                } else {
                    reject({message: result.message});
                }
            }, function (err) {
                reject({message: err});
            });
        }
    });
}

/**
 * Update the scheduled report
 * @param request
 * @return new Promise<Message>
 */
function updateScheduledReport(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Update report with param`, request.report);
        const result = validator.validateReportReqBody(request.report);
        if (result.error) {
            reject({message: result.error.details[0].message.replace(/"/g, "")});
        } else {
            jobs.modifyJob(request.report).then(function (result) {
                if (result.success === 1) {
                    resolve({});
                } else {
                    reject({message: result.message});
                }
            }, function (err) {
                reject({message: err});
            })
        }
    });
}

/**
 * Delete a scheduled report
 * @param request
 * @return {Promise<Message>}
 */
function deleteScheduledReport(request) {
    return new Promise(function (resolve, reject) {
        jobs.deleteJob(request.visualizationId).then(function (result) {
            if (result.success === 1) {
                resolve({});
            } else {
                reject({message: result.message})
            }
        }, function (err) {
            reject({message: err})
        })
    })
}

/**
 * Retrieve scheduled report by visualization id.
 * @param request request
 * @return {Promise<Any>}
 */
function getScheduledReport(request) {
    let visualizationId = request.visualizationId;
    logger.info(`Get scheduled report via grpc for ${visualizationId}`);
    return new Promise(function (resolve, reject) {
        jobs.getJob(visualizationId)
            .then(function (result) {
                if (result.success === 1) {
                    resolve({report: result.job, message: result.message});
                } else {
                    reject({message: result.message});
                }
            }, function (err) {
                reject(err);
            });
    })
}

/**
 * Retrieve all scheduled reports for user paginated.
 * @param username
 * @param page which page
 * @param size of the page
 * @return {Promise<any>}
 */
function getAllScheduledReportForUser(username, page, size) {
    return new Promise(function (resolve, reject) {
        const page = (+page);
        const pageSize = (+size);
        jobs.JobsByUser(username, page, pageSize).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
}

/**
 * Retrieve scheduled report counts for the given user.
 * @param username
 * @return {Promise<any>}
 */
function getScheduledReportCountsForUser(username) {
    return new Promise(function (resolve, reject) {
        jobs.JobCountByUser(username).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
}

/**
 * Retrieve logs for the specified report.
 * @param visualizationId
 * @return {Promise<any>}
 */
function getScheduledReportLogs(visualizationId) {
    return new Promise(function (resolve, reject) {
        jobs.jobLogs(visualizationId).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
}

/**
 * Immediately execute a report.
 * @param visualizationId
 * @return {Promise<any>}
 */
function executeReport(visualizationId) {
    return new Promise(function (resolve, reject) {
        jobs.executeImmediate(visualizationId).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
}



