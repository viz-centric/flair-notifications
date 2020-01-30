const nodemailer = require('nodemailer');
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
const axios = require('axios');
var moment = require('moment');
const dateFormat = "DD-MM-YYYY HH:mm";
var config = require('./team-message-payload');
const discovery = require('../discovery');
const taskLoggerURL = "#/administration/report-management#TaskLogger";
const AppConfig = require('./load-notification-config');

let flairBiUrl, notificationConfig;

async function init() {
    flairBiUrl = await discovery.getAppUrl('FLAIRBI') + taskLoggerURL;
    notificationConfig = await AppConfig.getConfig();
}
init();

var job = {

    saveCreatedJira: async function (jiraDetails, jiraSettings, reportsData) {

        const transaction = await db.sequelize.transaction();
        try {

            let jira = await models.JiraTickets.create({
                projectKey: jiraSettings.record.key,
                jiraID: jiraDetails.data.id,
                jiraKey: jiraDetails.data.key,
                jiraLink: jiraSettings.record.organization + "/browse/" + jiraDetails.data.key,
                createdAt: new Date(Date.now()).toISOString(),
                updatedAt: new Date(Date.now()).toISOString(),
                schedulerTaskLogsID: reportsData.SchedulerLogsMeta.id
            }, { transaction });

            await this.updateSchedulerTask(reportsData);

            await transaction.commit();

            logger.log({
                level: 'info',
                message: 'jira ticket is saved'
            });
            return ({
                message: "jira created successfully",
                jiraTicketLink: jiraSettings.record.organization + "/browse/" + jiraDetails.data.key,
            });

        }
        catch (ex) {
            transaction.rollback();

            logger.log({
                level: 'error',
                message: 'error occured while saving jira ticket',
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },


    updateSchedulerTask: async function (reportsData) {
        const transaction = await db.sequelize.transaction();
        try {

            let SchedulerTaskLog = await models.SchedulerTaskLog.update({
                isTicketCreated: true
            },
                {
                    where: {
                        id: reportsData.SchedulerLogsMeta.SchedulerTaskLogId
                    }
                }, { transaction });

            await transaction.commit();
        }
        catch (ex) {
            transaction.rollback();

            logger.log({
                level: 'error',
                message: 'error occured while updateing  scheduler task log',
                error: ex,
            });
            return { success: 0, message: ex };
        }
    },
    getTicketsList: async function (response, jiraSettings) {
        try {
            var issueList = [], totalIssue = 0;
            totalIssue = response.data.total;
            response.data.issues.forEach(element => {
                var issue = {};
                issue.issueID = element.id;
                issue.projectKey = element.fields.project.name;
                issue.status = element.fields.status.name;
                issue.createDate = element.fields.created;
                if (element.fields.assignee) {
                    issue.assignPerson = element.fields.assignee.name + "/" + element.fields.assignee.emailAddress;
                }
                else {
                    issue.assignPerson = "";
                }
                issue.reporter = element.fields.reporter.name + "/ " + element.fields.reporter.emailAddress;
                issue.priority = element.fields.priority.name;
                issue.summary = element.fields.summary;
                issue.createdBy = element.fields.creator.name + "/ " + element.fields.creator.emailAddress;
                issue.viewTicket = element.key + "|" + jiraSettings.record.organization + "/browse/" + element.key;

                issueList.push(issue);
            });
            return {
                issues: issueList,
                totalRecords: totalIssue
            };
        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error occured while creating tickets list',
                error: error,
            });
            return { success: 0, message: error };
        }

    },
    getReportLogs: async function (SchedulerLogs, report) {
        try {
            var outputlogs = [];
            for (var logItem of SchedulerLogs.rows) {
                var log = {};
                log.taskStatus = logItem.task_status;
                log.thresholdMet = logItem.thresholdMet;
                log.notificationSent = logItem.notificationSent;
                log.channel = logItem.channel;
                if (logItem.SchedulerTaskMetum) {
                    log.schedulerTaskMetaId = logItem.SchedulerTaskMetum.id;
                    log.viewData = logItem.SchedulerTaskMetum.viewData;
                    log.viewTicket = await this.getJiraLink(logItem.SchedulerTaskMetum.id);
                }
                log.dashboardName = report.dashboard_name;
                log.viewName = report.view_name;

                log.descripition = report.mail_body;
                log.isTicketCreated = logItem.isTicketCreated;
                log.enableTicketCreation = logItem.enableTicketCreation;
                log.comment = "";
                log.taskExecuted = moment(logItem.task_executed).format(dateFormat)
                outputlogs.push(log);
            }
            return {
                success: 1,
                totalRecords: SchedulerLogs.count,
                SchedulerLogs: outputlogs
            };
        } catch (error) {
            return "error occured while creating ReportLog list";
        }

    },
    getJiraLink: async function (id) {
        try {
            var SchedulerLogs = await models.JiraTickets.findOne({
                where: {
                    schedulerTaskLogsID: id
                }
            });
            if (SchedulerLogs) {
                return SchedulerLogs.jiraLink;
            }
            else {
                return "Jira not created";;
            }
        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error while fetching Jira Tickets',
                error: ex.getMessage(),
            });
            return "error occurred while getting jira Tickets";
        }

    },
    sendEmailMessage: async function (emailConfig) {

        try {
            var SMTPConfig = emailConfig.SMTPConfig;
            var assign = Object.keys(emailConfig.assign);
            this.sendMail(assign, "assign", emailConfig["assign"], SMTPConfig);

            var createdBy = Object.keys(emailConfig.assign);
            this.sendMail(createdBy, "created by ", emailConfig["createdBy"], SMTPConfig);

        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error occurred while sending notification of open tickets',
                error: error,
            });
        }
    },
    sendMail: async function (userList, userType, tickets, SMTPConfig) {

        var transporter = nodemailer.createTransport({
            host: SMTPConfig.records.config.host,
            port: SMTPConfig.records.config.port,
            pool: true,
            secure: false,
            auth: {
                user: SMTPConfig.records.config.user,
                pass: SMTPConfig.records.config.password
            },
            tls: {
                rejectUnauthorized: false
            }
        });

        var mailOptions = {
            from: SMTPConfig.records.config.sender,
            to: null,
            subject: null,
            html: ""
        };
        userList.forEach(function (element) {
            if (element !== "") {
                mailOptions.subject = notificationConfig.notifyOpenedTicketSubject + moment(moment().format()).format(dateFormat);
                mailOptions.to = element.split("/")[1];
                mailOptions.html = "<h3>" + notificationConfig.notifyOpenedTicketBody + "</h3>"
                tickets[element].forEach(function (ticket) {
                    mailOptions.html += "<li><a target='_blank' href=" + ticket.viewTicket.split('|')[1] + ">" + ticket.viewTicket.split('|')[0] + " : " + ticket.summary + "</a></li>"
                })
                transporter.sendMail(mailOptions, function (err, info) {
                    if (err) {
                        logger.log({
                            level: 'error',
                            message: 'error occurred while sending email notification for open tickets',
                            error: error,
                        });
                        reject(err)
                    } else {
                        resolve(info.response);
                    }
                });
            }
        })
    },
    sendTeamMessage: async function (tickets, webhook) {
        try {

            config.title = notificationConfig.notifyOpenedTicketSubject + moment(moment().format()).format(dateFormat);

            var html = "<h3>" + notificationConfig.notifyOpenedTicketBody + "</h3>";
            tickets.forEach(function (ticket, index) {
                html += "<li><a target='_blank' href=" + ticket.viewTicket.split('|')[1] + ">" + ticket.viewTicket.split('|')[0] + " : " + ticket.summary + "</a></li>"
            })
            config.sections[0].text = html;
            config.summary = "summary";

            config.sections[0].facts = null;
            config.potentialAction = [];

            if (tickets.length > 15) {
                config.potentialAction.push({
                    "@type": "OpenUri",
                    "name": "View more open Jira tickets",
                    "targets": [
                        { "os": "default", "uri": flairBiUrl }
                    ]
                })
            }

            await axios.post(webhook, config)
                .then(async (res) => {
                    try {
                        if (res.data == "1") {
                            logger.log({
                                level: 'info',
                                message: 'notification is sent to team successfully'
                            });
                        }
                        else {
                            logger.log({
                                level: 'error',
                                message: 'error occurred while sending team notification for open tickets',
                                errMsg: res.data,
                            });
                        }
                    } catch (error) {
                        logger.log({
                            level: 'error',
                            message: 'error occurred while sending team notification for open tickets',
                            errMsg: error,
                        });
                    }
                })
                .catch((error) => {
                    logger.log({
                        level: 'error',
                        message: 'error occurred while sending team notification for open tickets',
                        errMsg: error,
                    });

                })
        } catch (error) {
            logger.log({
                level: 'error',
                message: 'error occurred while sending team notification',
                errMsg: error,
            });
        }
    },

}

module.exports = job;
