
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
var util = require('../util');

var job = {

    addChannel: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            try {
                //create report object
                let channel = await models.CommunicationChannels.create({
                    id: request.communication_channel_id,
                    channel_parameters: request.channel_parameters
                }, { transaction });

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'new Channel is saved into database',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "Channel is added successfully", channel: channel.communication_channel_id
                });

            }
            catch (ex) {
                await transaction.rollback();
                if (ex.name == "SequelizeUniqueConstraintError") {
                    logger.log({
                        level: 'info',
                        message: 'channel already exist',
                    });
                    var response = { success: 0, message: "channel already exist" }
                    return response;
                }
                logger.log({
                    level: 'error',
                    message: 'error while saving channel into database',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
    },

    getChannel: async function () {

        try {
            var channel = await models.CommunicationChannels.findAll();
            if (channel) {
                return {
                    success: 1,
                    records: channel
                };
            }
            else {
                return { success: 0, message: "report not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching channel',
                error: ex,
            });
            return { success: 0, message: ex };
        }


    },

    getChannelByChannelName: async function (request) {
        if (request) {
            try {
                var channel = await models.CommunicationChannels.findOne({
                    where: {
                        id: request
                    }
                });
                if (channel) {
                    return {
                        success: 1,
                        records: channel.channel_parameters
                    };
                }
                else {
                    return { success: 0, message: "report not found" };
                }
            }
            catch (ex) {
                logger.log({
                    level: 'error',
                    message: 'error while fetching channel',
                    error: ex,
                });
                return { success: 0, message: ex };
            }

        }
    },

    updateChannelByChannelName: async function (request) {
        if (request) {
            var exist_channel = await models.CommunicationChannels.findOne({
                where: {
                    id: request.communication_channel_id
                }
            });

            if (exist_channel) {
                const transaction = await db.sequelize.transaction();
                try {
                    let channel = await models.CommunicationChannels.update({
                        channel_parameters: request.channel_parameters,
                    },
                        {
                            where: {
                                id: request.communication_channel_id
                            }
                        }, { transaction });

                    await transaction.commit();
                    return { success: 1, message: 'Channel updated successfully' };
                }
                catch (ex) {
                    await transaction.rollback();
                    logger.log({
                        level: 'error',
                        message: 'error while fetching channel',
                        error: ex,
                    });
                    return { success: 0, message: ex };
                }
            }
            else {
                logger.log({
                    level: 'info',
                    message: 'channel not found'
                });
                return { success: 0, message: message };
            }
        }
    }

}

module.exports = job;
