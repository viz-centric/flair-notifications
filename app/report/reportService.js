const jobs = require('./../jobs');
const validator = require('./../validator');
const logger = require('./../logger');


module.exports ={
    scheduleReport:scheduleReport
};
/**
 * Schedule a report.
 * @param report to be scheduled
 * @returns {Promise<any>}
 */
function scheduleReport(report){
    return new Promise(function (resolve, reject) {
        const result = validator.validateReportReqBody(report);
        if (result.error) {
            logger.log({
                level: 'error',
                message: 'error in schedule api due to invalid request body',
                errMsg: result.error.details[0].message
            });

            reject({
                message: result.error.details[0].message.replace(/"/g, "")
            });
        }
        else {
            jobs.createJob(report).then(function (result) {
                if (result.success === 1) {
                    resolve({
                        message: result.message
                    });
                }
                else {
                    reject({
                        message: result.message
                    });
                }
            }, function (err) {
                reject(err);
            });
        }
    });
}




