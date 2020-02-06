const models = require('../database/models/index');
const logger = require('../logger');
const channelJobs = require('../jobs/channelJobs');
const dateFormat = "DD-MM-YYYY HH:mm";
const moment = require('moment');
const service = {
    getSchedulerTaskMeta
};

async function getSchedulerTaskMeta(taskLogMetaId) {
    logger.info(`Get scheduler task meta for id ${taskLogMetaId}`);
    //  return models.SchedulerTaskMeta.findOne({where: {id: taskLogMetaId}});
    var schedulerMeta = await channelJobs.getSchedulerMetaData(taskLogMetaId);
    var scheduleData = {};
    scheduleData.dashboardName = schedulerMeta.report.dashboard_name;
    scheduleData.comment = schedulerMeta.report.title_name;
    scheduleData.viewName = schedulerMeta.report.view_name;
    scheduleData.descripition = schedulerMeta.report.mail_body;
    scheduleData.query = schedulerMeta.SchedulerLogsMeta.rawQuery;
    scheduleData.taskExecuted = moment(schedulerMeta.SchedulerLogsMeta.createdAt).format(dateFormat);

    return scheduleData;
}

module.exports = service;
