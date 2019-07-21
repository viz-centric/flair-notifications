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
 * @param report to be scheduled
 * @returns {Promise<Message>}
 */
function scheduleReport(report) {
    return new Promise(function (resolve, reject) {
        const result = validator.validateReportReqBody(report);
        if (result.error) {
            logger.log({
                level: 'error',
                message: 'error in schedule api due to invalid request body',
                errMsg: result.error.details[0].message
            });
            reject(new Message(result.error.details[0].message.replace(/"/g, "")));
        } else {
            jobs.createJob(report).then(function (result) {
                if (result.success === 1) {
                    resolve(new Message(result.message));
                } else {
                    reject(new Message(result.message));
                }
            }, function (err) {
                reject(new Message(err));
            });
        }
    });
}

/**
 * Update the scheduled report
 * @param report
 * @return new Promise<Message>
 */
function updateScheduledReport(report) {
    return new Promise(function (resolve, reject) {
        const result = validator.validateReportReqBody(report);
        if (result.error) {
            resolve(new Message(result.error.details[0].message.replace(/"/g, "")))
        } else {
            jobs.modifyJob(report).then(function (result) {
                if (result.success === 1) {
                    resolve(new Message(result.message));
                } else {
                    reject(new Message(result.message));
                }
            }, function (err) {
                reject(new Message(err));
            })
        }
    });
}

/**
 * Delete a scheduled report
 * @param visualizationId
 * @return {Promise<Message>}
 */
function deleteScheduledReport(visualizationId) {
    return new Promise(function (resolve, reject) {
        jobs.deleteJob(visualizationId).then(function (result) {
            resolve(new Message(result));
        }, function (err) {
            reject(new Message(err))
        })
    })
}

/**
 * Retrieve scheduled report by visualization id.
 * @param visualizationId
 * @return {Promise<Any>}
 */
function getScheduledReport(visualizationId) {
    return new Promise(function (resolve, reject) {
        jobs.getJob(visualizationId)
            .then(function (result) {
                resolve({report: result.job});
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



