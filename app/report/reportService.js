const jobs = require('./../jobs/schedulerJobs');
const channelJobs = require('./../jobs/channelJobs');

const schedulerTaskService = require('./../report/scheduler-task-service');
const validator = require('./../validator');
const logger = require('./../logger');


module.exports = {
    getScheduledReport: getScheduledReport,
    scheduleReport: scheduleReport,
    getAllScheduledReportForUser: getAllScheduledReportForUser,
    getScheduledReportCountsForUser: getScheduledReportCountsForUser,
    getScheduleReportLogs: getScheduleReportLogs,
    updateScheduledReport: updateScheduledReport,
    deleteScheduledReport: deleteScheduledReport,
    executeReport: executeReport,
    searchReports,
    getScheduleReportLog,
    getChannelProperties,
    getTeamConfig,
    getEmailConfig,
    updateTeamWebhookURL,
    updateEmailSMTP,
    addTeamConfigs,
    addEmailConfigs,
    deleteChannelConfig
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
        const resultReport = validator.validateReportReqBody(request.report);
        if (resultReport.error) {
            logger.log({
                level: 'error',
                message: 'error in schedule api due to invalid request body',
                errMsg: resultReport.error.details[0].message
            });
            reject({ message: resultReport.error.details[0].message.replace(/"/g, "") });
        } else {
            jobs.createJob(resultReport.value).then(function (result) {
                if (result.success === 1) {
                    resolve(result);
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject({ message: err });
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
        const resultReport = validator.validateReportReqBody(request.report);
        if (resultReport.error) {
            reject({ message: resultReport.error.details[0].message.replace(/"/g, "") });
        } else {
            jobs.modifyJob(resultReport.value).then(function (result) {
                if (result.success === 1) {
                    resolve(result);
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
 * Delete a scheduled report
 * @param visualizationId
 * @return {Promise<Message>}
 */
function deleteScheduledReport(request) {
    return new Promise(function (resolve, reject) {
        jobs.deleteJob(request.visualizationId).then(function (result) {
            if (result.success === 1) {
                resolve(result);
            } else {
                reject({ message: result.message })
            }
        }, function (err) {
            reject({ message: err })
        })
    });
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
                    resolve({ report: result.job, message: result.message });
                } else {
                    reject({ message: result.message });
                }
            }, function (err) {
                reject(err);
            });
    })
}

/**
 * Retrieve all scheduled reports for user paginated.
 * @param request
 * @return {Promise<any>}
 */
function getAllScheduledReportForUser(request) {
    let username = request.username;
    let page = (+request.page);
    let pageSize = (+request.pageSize);
    logger.info(`Calling 1 get all reports for user ${username} page ${page} size ${pageSize}`);
    return new Promise(function (resolve, reject) {
        jobs.JobsByUser(username, page, pageSize).then(function (result) {
            resolve({
                reports: result.reports
            });
        }, function (err) {
            reject(err);
        })
    })
}

/**
 * Retrieve scheduled report counts for the given user.
 * @param request
 * @return {Promise<any>}
 */
function getScheduledReportCountsForUser(request) {
    return new Promise(function (resolve, reject) {
        jobs.JobCountByUser(request.username).then(function (result) {
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
function getScheduleReportLogs(request) {
    logger.info(`Get scheduled report logs via grpc for ${request.visualizationId} page ${request.page} size ${request.pageSize}`);
    return new Promise(function (resolve, reject) {
        jobs.jobLogs(request.visualizationId, request.page, request.pageSize).then(function (result) {
            if (result.success === 1) {
                resolve({ totalRecords: result.totalRecords, SchedulerLogs: result.SchedulerLogs });
            } else {
                reject({ message: result.message });
            }
        }, function (err) {
            reject(err);
        })
    })
}

async function getScheduleReportLog(request) {
    const taskLogMetaId = request.task_log_meta_id;
    logger.info(`Get scheduled report log via grpc for ${taskLogMetaId}`);
    let taskMeta;
    try {
        taskMeta = await schedulerTaskService.getSchedulerTaskMeta(taskLogMetaId);
    } catch (e) {
        logger.error(`Get scheduled report log error via grpc for ${taskLogMetaId}`, e);
        throw { error: { message: `Error loading schedule report log ${e.message}` } };
    }
    logger.info(`Get scheduled report log via grpc for ${taskLogMetaId} result`, taskMeta);
    return { report_log: { query: taskMeta.rawQuery } };
}

function searchReports(request) {
    logger.info(`Search reports for`, request);
    return new Promise(function (resolve, reject) {
        jobs.filterJobs(
            request.username, request.reportName, request.startDate,
            request.endDate, request.page, request.pageSize
        )
            .then(function (result) {
                if (result.success === 1) {
                    resolve({
                        totalRecords: result.totalRecords,
                        records: result.records
                    });
                } else {
                    resolve({ message: result.message });
                }
            }, function (err) {
                reject(err);
            });
    });
}

/**
 * Immediately execute a report.
 * @param request
 * @return {Promise<any>}
 */
function executeReport(request) {
    logger.info(`Execute report for ${request.visualizationId}`);
    return new Promise(function (resolve, reject) {
        jobs.executeImmediate(request.visualizationId).then(function (result) {
            resolve(result);
        }, function (err) {
            reject(err);
        })
    })
}

/**
 * get Channel Properties
 * @param channel
 * @return {Promise<any>}
 */
function getChannelProperties(request) {
    return new Promise(function (resolve, reject) {
        logger.info(`Get channel config for ${request.channel}`);
        channelJobs.getChannelProperties().then(function (result) {
            if (result.success === 1) {
                resolve({ channelParameters: result.channelProperties });
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

        channelJobs.updateTeamWebhookURL(request).then(function (result) {
            if (result.success === 1) {
                reject(result.message);
            } else {
                reject(result.message);
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

        channelJobs.updateEmailSMTP(request.emailParameter).then(function (result) {
            if (result.success === 1) {
                reject({ message: result.message });
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
        channelJobs.getTeamConfig().then(function (result) {
            if (result.success === 1) {
                resolve({ records: result.records });
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
        channelJobs.getEmailConfig().then(function (result) {
            if (result.success === 1) {
                resolve({ record: result.record });
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
            channelJobs.addTeamConfigs(request).then(function (result) {
                if (result.success === 1) {
                    resolve(result.message);
                } else {
                    reject(result.message);
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
            channelJobs.addEmailConfigs(request).then(function (result) {
                if (result.success === 1) {
                    resolve(result.message);
                } else {
                    reject(result.message);
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
        logger.info(`deleteing webhook URL`, request);
        if (request) {
            channelJobs.deleteChannelConfig(request.id).then(function (result) {
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