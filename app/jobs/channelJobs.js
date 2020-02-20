
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
var util = require('../util');
var axios = require('axios');
var jiraConfig = require('./jira-ticket');
var modelsUtil = require('./models-utils');
const AppConfig = require('./load-notification-config');

var moment = require('moment');

let notificationConfig;

async function init() {
    notificationConfig = await AppConfig.getConfig();
}
init();

var job = {
    getChannelProperties: async function () {
        try {
            var channel = await models.CommunicationChannels.findAll();
            var channelList = [];
            if (channel) {
                for (let index = 0; index < channel.length; index++) {
                    var channelObject = {};
                    channelObject.id = channel[index].id
                    channelObject.connectionProperties = channel[index].channel_parameters.connectionProperties
                    channelList.push(channelObject);
                }
            }
            else {
                return { success: 0, message: "channel is not found" };
            }
            return { success: 1, channelProperties: channelList };
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
                var webhook = util.encrypt(request.teamConfigParameter.webhookURL);
                request.teamConfigParameter.webhookURL = webhook

                let channel = await models.ChannelConfigs.create({
                    config: request.teamConfigParameter,
                    communication_channel_id: "Teams"
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
            let channel;
            try {
                var emailSMTP = await models.ChannelConfigs.findOne({
                    where: {
                        communication_channel_id: "Email"
                    }
                });

                request.emailParameter.password = util.encrypt(request.emailParameter.password);;

                if (emailSMTP) {
                    channel = await models.ChannelConfigs.update({
                        config: request.emailParameter,
                        communication_channel_id: request.communication_channel_id
                    },
                        {
                            where: {
                                communication_channel_id: "Email"
                            }
                        }, { transaction });
                }
                else {
                    channel = await models.ChannelConfigs.create({
                        config: request.emailParameter,
                        communication_channel_id: "Email"
                    }, { transaction });
                }

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
            var webhookList = [];
            var channel = await models.ChannelConfigs.findAll({
                where: {
                    communication_channel_id: "Teams"
                }
            });
            if (channel) {
                for (let index = 0; index < channel.length; index++) {
                    var webhookData = {};
                    var webhook = util.decrypt(channel[index].config.webhookURL);
                    channel[index].config.webhookURL = webhook;
                    webhookData.id = parseInt(channel[index].id);
                    webhookData.webhookName = channel[index].config.webhookName;
                    webhookData.webhookURL = webhook;
                    webhookList.push(webhookData);
                }
                return {
                    success: 1,
                    records: webhookList
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
            var channel = await models.ChannelConfigs.findOne({
                where: {
                    communication_channel_id: "Email"
                }
            });
            if (channel) {
                var password = util.decrypt(channel.config.password);
                channel.config.id = channel.id;
                channel.config.password = password;
                return {
                    success: 1,
                    record: channel.config
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
                    id: request.teamConfigParameter.id,
                    communication_channel_id: "Teams"
                }
            });

            if (exist_channel) {
                const transaction = await db.sequelize.transaction();
                try {
                    var webhook = util.encrypt(request.teamConfigParameter.webhookURL);
                    request.teamConfigParameter.webhookURL = webhook

                    let channel = await models.ChannelConfigs.update({
                        config: request.teamConfigParameter,
                    },
                        {
                            where: {
                                communication_channel_id: "Teams",
                                id: request.teamConfigParameter.id,
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
                                communication_channel_id: "Email"
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
                return { success: 0, message: "channel is not found" };
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
                return { success: 0, message: "Email SMTP is not configured" };
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

    //jira method start
    AddJiraConfigs: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            let channel;
            try {
                var jira = await models.ChannelConfigs.findOne({
                    where: {
                        communication_channel_id: "Jira"
                    }
                });

                request.jiraParameter.apiToken = util.encrypt(request.jiraParameter.apiToken);

                if (jira) {
                    channel = await models.ChannelConfigs.update({
                        config: request.jiraParameter,
                        communication_channel_id: 'Jira'
                    },
                        {
                            where: {
                                communication_channel_id: "Jira"
                            }
                        }, { transaction });
                }
                else {
                    channel = await models.ChannelConfigs.create({
                        config: request.jiraParameter,
                        communication_channel_id: "Jira"
                    }, { transaction });
                }

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'new Jira config is saved into database',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "new Jira config is added successfully"
                });

            }
            catch (ex) {
                await transaction.rollback();

                logger.log({
                    level: 'error',
                    message: 'error while saving Jira config into database',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
    },

    updateJiraConfiguration: async function (request) {
        if (request) {
            const transaction = await db.sequelize.transaction();
            let channel;
            try {
                var jira = await models.ChannelConfigs.findOne({
                    where: {
                        communication_channel_id: "Jira"
                    }
                });

                request.emailParameter.password = util.encrypt(request.emailParameter.password);;

                if (jira) {
                    channel = await models.ChannelConfigs.update({
                        config: request.emailParameter,
                        communication_channel_id: request.communication_channel_id
                    },
                        {
                            where: {
                                communication_channel_id: "Jira"
                            }
                        }, { transaction });
                }

                await transaction.commit();

                logger.log({
                    level: 'info',
                    message: 'Jira configs are updated successfully',
                    channel: channel.communication_channel_id,
                });
                return ({
                    success: 1, message: "Jira configs are updated successfully"
                });

            }
            catch (ex) {
                await transaction.rollback();

                logger.log({
                    level: 'error',
                    message: 'error while updating Jira configs',
                    error: ex,
                });
                return { success: 0, message: ex };
            }
        }
    },

    getJiraConfig: async function () {
        try {
            var channel = await models.ChannelConfigs.findOne({
                where: {
                    communication_channel_id: "Jira"
                }
            });
            if (channel) {
                var apiToken = util.decrypt(channel.config.apiToken);
                channel.config.apiToken = apiToken;
                channel.config.id = channel.id;
                return {
                    success: 1,
                    record: channel.config
                };
            }
            else {
                return { success: 0, message: "Jira config is not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching Jira config',
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },

    getSchedulerMetaData: async function (request) {
        try {
            var report;
            var SchedulerLogsMeta = await models.SchedulerTaskMeta.findOne({
                include: [
                    {
                        model: models.SchedulerTaskLog,
                    }],
                where: {
                    id: request
                }
            })
            if (SchedulerLogsMeta) {
                var SchedulerJob = await models.SchedulerTask.findOne({
                    where: { id: SchedulerLogsMeta.SchedulerTaskLog.SchedulerJobId }
                });

                report = await models.Report.findOne({
                    include: [
                        {
                            model: models.AssignReport,
                        },
                        {
                            model: models.ReportLineItem,
                            as: 'reportline',
                        }],
                    where: { id: SchedulerJob.ReportId }
                });
            }

            if (report) {
                return {
                    report: report,
                    SchedulerLogsMeta: SchedulerLogsMeta
                }

            }
        } catch (error) {
            return {
                message: "Scheduler logs metadata not found "
            }
        }
    },
    createJiraTicket: async function (request) {
        var jiraSettings = await this.getJiraConfig();
        var reportsData = await this.getSchedulerMetaData(request.id);
        var jiraCreated = false, jiraDetails;
        jiraConfig.fields.project.key = jiraSettings.record.key;
        jiraConfig.fields.summary = notificationConfig.ticketTitlePrefix + ": " + reportsData.report.title_name + " (" + reportsData.report.dashboard_name + ")" + moment(reportsData.SchedulerLogsMeta.createdAt).format(util.dateFormat());;

        jiraConfig.fields.description.content[0].content[0].text = reportsData.report.mail_body;
        jiraConfig.fields.description.content[1].content[0].marks[0].attrs.href = reportsData.report.share_link;
        jiraConfig.fields.description.content[2].content[0].marks[0].attrs.href = reportsData.report.build_url;
        jiraConfig.fields.description.content[3].content[0].marks[0].attrs.href = reportsData.SchedulerLogsMeta.viewData;
        jiraConfig.fields.description.content[4].content[0].marks[0].attrs.href = util.getGlairInsightsLink(reportsData.report.share_link, reportsData.report.reportline.visualizationid, reportsData.report.thresholdAlert);

        await axios.post(jiraSettings.record.organization + '/rest/api/3/issue', jiraConfig, {

            withCredentials: true,
            auth: {
                username: jiraSettings.record.userName,
                password: jiraSettings.record.apiToken,
            }
        })
            .then((res) => {
                if (res.data.id) {
                    jiraCreated = true;
                    jiraDetails = res;
                }
            })
            .catch((error) => {
                logger.log({
                    level: 'error',
                    message: 'error occured while creating jira ticket',
                    error: error.message
                });
            })

        if (jiraCreated) {

            return await modelsUtil.saveCreatedJira(jiraDetails, jiraSettings, reportsData)
        }
        else {
            logger.log({
                level: 'error',
                message: 'error occured while creating jira ticket',
            });
            return ({
                message: "error occured while creating jira ticket",
                jiraTicketLink: ""
            });
        }
    },

    getAllJira: async function (request) {
        try {
            var issueList = [], totalIssue = 0, jiraId = [], response;
            var jiraSettings = await this.getJiraConfig();
            var JiraTickets = await this.getCreatedTicketList();

            JiraTickets.forEach(element => {
                jiraId.push(element.jiraKey);
            });

            config = {
                'All': {
                    getEndPoint: function () {
                        return jiraSettings.record.organization + '/rest/api/3/search?jql=project in (' + jiraSettings.record.key + ') AND id in (' + jiraId.toString() + ') &startAt=' + request.page * request.pageSize + '&maxResults=' + request.pageSize + '';
                    }
                },
                'Closed': {
                    getEndPoint: function () {
                        return jiraSettings.record.organization + '/rest/api/3/search?jql=project in (' + jiraSettings.record.key + ') AND status=Done AND id in (' + jiraId.toString() + ') &startAt=' + request.page * request.pageSize + '&maxResults=' + request.pageSize + '';
                    }
                },
                'Open': {
                    getEndPoint: function () {
                        return jiraSettings.record.organization + '/rest/api/3/search?jql=project in (' + jiraSettings.record.key + ') AND status!=Done AND id in (' + jiraId.toString() + ') &startAt=' + request.page * request.pageSize + '&maxResults=' + request.pageSize + '';
                    }
                },
                'In Progress': {
                    getEndPoint: function () {
                        return jiraSettings.record.organization + '/rest/api/3/search?jql=project in (' + jiraSettings.record.key + ') AND status="In Progress" AND id in (' + jiraId.toString() + ') &startAt=' + request.page * request.pageSize + '&maxResults=' + request.pageSize + '';
                    }
                },
                'To Do': {
                    getEndPoint: function () {
                        return jiraSettings.record.organization + '/rest/api/3/search?jql=project in (' + jiraSettings.record.key + ') AND status="To Do" AND id in (' + jiraId.toString() + ') &startAt=' + request.page * request.pageSize + '&maxResults=' + request.pageSize + '';
                    }
                }
            };

            await axios.get(config[request.status].getEndPoint(), {

                withCredentials: true,
                auth: {
                    username: jiraSettings.record.userName,
                    password: jiraSettings.record.apiToken,
                }
            })
                .then((res) => {
                    response = res;
                })
                .catch((error) => {
                    logger.log({
                        level: 'error',
                        message: 'error occured while fetching Jira Tickets',
                    })
                    return { success: 1, message: 'error' };
                })
            var jiraTickets = await modelsUtil.getTicketsList(response, jiraSettings);
            issueList = jiraTickets.issues;
            totalIssue = jiraTickets.totalRecords
            return {
                success: 1,
                issues: issueList,
                totalRecords: totalIssue
            };
        } catch (error) {
            return { success: 0, message: 'error' };
        }

    },
    getCreatedTicketList: async function () {
        try {
            var JiraTickets = await models.JiraTickets.findAll();
            if (JiraTickets) {

                return JiraTickets
            }
            else {
                return { success: 0, message: "Jira Tickets is not found" };
            }
        }
        catch (ex) {
            logger.log({
                level: 'error',
                message: 'error while fetching Jira Tickets',
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },

    sentMailForOpenTickets: async function (config) {
        try {
            var emailConfig = {};
            var jira = {
                status: "Open",
                page: 0,
                pageSize: 10
            }
            var openTickets = await this.getAllJira(jira);

            var channelList = util.channelList();

            if (util.checkChannel(config.openJiraTicketConfig.channels, channelList.email)) {

                emailConfig.SMTPConfig = await this.getSMTPConfig();

                emailConfig.createdBy = openTickets.issues.reduce(function (r, a) {
                    r[a.createdBy] = r[a.createdBy] || [];
                    r[a.createdBy].push(a);
                    return r;
                }, Object.create(null));

                emailConfig.assign = openTickets.issues.reduce(function (r, a) {
                    r[a.assignPerson] = r[a.assignPerson] || [];
                    r[a.assignPerson].push(a);
                    return r;
                }, Object.create(null));

                modelsUtil.sendEmailMessage(emailConfig);
            }
            if (util.checkChannel(config.openJiraTicketConfig.channels, channelList.team)) {
                var webhook = await this.getWebhookList([config.openJiraTicketConfig.webhookID]);
                if (webhook.records) {
                    modelsUtil.sendTeamMessage(openTickets.issues, webhook.records[0].config.webhookURL);
                }
            }
            return {
                message: "notification sent successfully for open tickets",
                success: 1,
            }

        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error occured while sending notification for open tickets',
                error: error,
            });
            return { success: 0, message: 'error occured while sending notification for open tickets' + error };
        }
    },
    //jira method end
}

module.exports = job;
