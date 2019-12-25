
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
var util = require('../util');

var job = {
    getChannelProperties: async function () {
        try {
            var channel = await models.CommunicationChannels.findAll();
            if (channel) {
                return {
                    success: 1,
                    records: channel
                };
            }
            else {
                return { success: 0, message: "channel not found" };
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

    addChannelConfigs: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            try {
                if (request.communication_channel_id == "team") {
                    var webhook = util.encrypt(request.config.webhook);
                    request.config.webhook = webhook
                }
                else if (request.communication_channel_id == "email") {
                    var password = util.encrypt(request.config.password);
                    request.config.password = password
                }

                let channel = await models.ChannelConfigs.create({
                    config: request.config,
                    communication_channel_id: request.communication_channel_id
                }, { transaction });

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'new channel info is saved into database',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "Channel is added successfully", channel: channel.communication_channel_id
                });

            }
            catch (ex) {
                await transaction.rollback();

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
            var channel = await models.ChannelConfigs.findAll();
            if (channel) {

                for (let index = 0; index < channel.length; index++) {
                    if (channel[index].communication_channel_id == "team") {
                        var webhook = util.decrypt(channel[index].config.webhook);
                        channel[index].config.webhook = webhook
                    }
                    else if (channel[index].communication_channel_id == "email") {
                        var password = util.decrypt(channel[index].config.password);
                        channel[index].config.password = password
                    }
                }
                return {
                    success: 1,
                    records: channel
                };
            }
            else {
                return { success: 0, message: "channel not found" };
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
                var channel = await models.ChannelConfigs.findAll({
                    where: {
                        communication_channel_id: request
                    }
                });
                if (channel) {

                    for (let index = 0; index < channel.length; index++) {
                        if (channel[index].communication_channel_id == "team") {
                            var webhook = util.decrypt(channel[index].config.webhook);
                            channel[index].config.webhook = webhook
                        }
                        else if (channel[index].communication_channel_id == "email") {
                            var password = util.decrypt(channel[index].config.password);
                            channel[index].config.password = password
                        }
                    }
                    return {
                        success: 1,
                        records: channel
                    };
                }
                else {
                    return { success: 0, message: "channel not found" };
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

    updateChannel: async function (request) {
        if (request) {
            var exist_channel = await models.ChannelConfigs.findOne({
                where: {
                    id: request.id
                }
            });

            if (exist_channel) {
                const transaction = await db.sequelize.transaction();
                try {
                    if (request.communication_channel_id == "team") {
                        var webhook = util.encrypt(request.config.webhook);
                        request.config.webhook = webhook
                    }
                    else if (request.communication_channel_id == "email") {
                        var password = util.encrypt(request.config.password);
                        request.config.password = password
                    }

                    let channel = await models.ChannelConfigs.update({
                        config: request.config,
                    },
                        {
                            where: {
                                communication_channel_id: request.communication_channel_id
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
    },

    deleteChannelConfig: async function (id) {

        var exist_channel = await models.ChannelConfigs.findOne({
            where: {
                id: id
            }
        });

        if (exist_channel) {
            const transaction = await db.sequelize.transaction();
            try {
                await exist_channel.destroy({ force: true });
                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'Channel config deleted successfully'
                });
                return { success: 1, message: 'Channel config deleted successfully' };
            }
            catch (ex) {
                await transaction.rollback();
                logger.log({
                    level: 'error',
                    message: 'error while fetching channel config',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
        else {
            logger.log({
                level: 'info',
                message: 'channel config not found'
            });
            return { success: 0, message: message };
        }
    }

}

module.exports = job;
