
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
var util = require('../util');

var job = {
    getChannelProperties: async function () {
        try {
            var channel = await models.CommunicationChannels.findAll();
            if (channel) {
                return { channelProperties: channel };
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

    addTeamConfigs: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            try {
                var webhook = util.encrypt(request.config.webhookURL);
                request.config.webhookURL = webhook

                let channel = await models.ChannelConfigs.create({
                    config: request.config,
                    communication_channel_id: request.communication_channel_id
                }, { transaction });

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'new team config is saved into database',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "new team config is added successfully"
                });

            }
            catch (ex) {
                await transaction.rollback();

                logger.log({
                    level: 'error',
                    message: 'error while saving team config into database',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
    },

    addEmailConfigs: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            try {
                var password = util.encrypt(request.config.password);
                request.config.password = password

                let channel = await models.ChannelConfigs.create({
                    config: request.config,
                    communication_channel_id: request.communication_channel_id
                }, { transaction });

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'new email config is saved into database',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "new email config is added successfully"
                });

            }
            catch (ex) {
                await transaction.rollback();

                logger.log({
                    level: 'error',
                    message: 'error while saving email config into database',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
    },

    getTeamConfig: async function () {
        try {
            var channel = await models.ChannelConfigs.findAll({
                where: {
                    communication_channel_id: "Teams"
                }
            });
            if (channel) {

                for (let index = 0; index < channel.length; index++) {
                    var webhook = util.decrypt(channel[index].config.webhookURL);
                    channel[index].config.webhookURL = webhook;
                }
                return {
                    success: 1,
                    records: channel
                };
            }
            else {
                return { success: 0, message: "team webhook URL not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching team webhook',
                error: ex,
            });
            return { success: 0, message: ex };
        }


    },

    getEmailConfig: async function () {
        try {
            var channel = await models.ChannelConfigs.findAll({
                where: {
                    communication_channel_id: "Email"
                }
            });
            if (channel) {
                for (let index = 0; index < channel.length; index++) {
                    var password = util.decrypt(channel[index].config.password);
                    channel[index].config.password = password;
                }
                return {
                    success: 1,
                    records: channel
                };
            }
            else {
                return { success: 0, message: "SMTP config not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching SMTP config',
                error: ex,
            });
            return { success: 0, message: ex };
        }


    },

    updateTeamWebhookURL: async function (request) {
        if (request) {
            var exist_channel = await models.ChannelConfigs.findOne({
                where: {
                    id: request.id,
                    communication_channel_id: "Teams"
                }
            });

            if (exist_channel) {
                const transaction = await db.sequelize.transaction();
                try {
                    var webhook = util.encrypt(request.config.webhookURL);
                    request.config.webhookURL = webhook

                    let channel = await models.ChannelConfigs.update({
                        config: request.config,
                    },
                        {
                            where: {
                                communication_channel_id: request.communication_channel_id,
                                id: request.id,
                            }
                        }, { transaction });

                    await transaction.commit();
                    return { success: 1, message: 'team webhook URL updated successfully' };
                }
                catch (ex) {
                    await transaction.rollback();
                    logger.log({
                        level: 'error',
                        message: 'error while fetching team webhook URL',
                        error: ex,
                    });
                    return { success: 0, message: ex };
                }
            }
            else {
                logger.log({
                    level: 'info',
                    message: 'team webhook URL not found'
                });
                return { success: 0, message: message };
            }
        }
    },

    updateEmailSMTP: async function (request) {
        if (request) {
            var exist_channel = await models.ChannelConfigs.findOne({
                where: {
                    id: request.id,
                    communication_channel_id: "Email"
                }
            });

            if (exist_channel) {
                const transaction = await db.sequelize.transaction();
                try {
                    var password = util.encrypt(request.config.password);
                    request.config.password = password

                    let channel = await models.ChannelConfigs.update({
                        config: request.config,
                    },
                        {
                            where: {
                                communication_channel_id: request.communication_channel_id,
                                id: request.id,
                            }
                        }, { transaction });

                    await transaction.commit();
                    return { success: 1, message: 'Email SMTP updated successfully' };
                }
                catch (ex) {
                    await transaction.rollback();
                    logger.log({
                        level: 'error',
                        message: 'error while fetching Email SMTP',
                        error: ex,
                    });
                    return { success: 0, message: ex };
                }
            }
            else {
                logger.log({
                    level: 'info',
                    message: 'Email SMTP not found'
                });
                return { success: 0, message: message };
            }
        }
    },

    deleteWebhookURL: async function (id) {

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
                    message: 'webhook URL deleted successfully'
                });
                return { success: 1, message: 'webhook URL deleted successfully' };
            }
            catch (ex) {
                await transaction.rollback();
                logger.log({
                    level: 'error',
                    message: 'error while fetching webhook URL',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
        else {
            logger.log({
                level: 'info',
                message: 'Webhook URL not found'
            });
            return { success: 0, message: message };
        }
    },

    getWebhookList: async function (ids) {
        try {
            var channel = await models.ChannelConfigs.findAll({
                where: {
                    id: ids
                }
            });
            if (channel) {

                for (let index = 0; index < channel.length; index++) {
                    if (channel[index].communication_channel_id == "Teams") {
                        var webhook = util.decrypt(channel[index].config.webhookURL);
                        channel[index].config.webhookURL = webhook
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

    getSMTPConfig: async function () {
        try {
            var channel = await models.ChannelConfigs.findOne({
                where: {
                    communication_channel_id: 'Email'
                }
            });
            if (channel) {
                channel.config.password = util.decrypt(channel.config.password)
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
}

module.exports = job;
