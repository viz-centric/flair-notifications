const models = require('../database/models/index');
const logger = require('../logger');

const service = {
    getSchedulerTaskMeta
};

async function getSchedulerTaskMeta(taskLogMetaId) {
    logger.info(`Get scheduler task meta for id ${taskLogMetaId}`);
    return models.SchedulerTaskMeta.findOne({where: {id: taskLogMetaId}});
}

module.exports = service;
