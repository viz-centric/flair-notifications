
var models = require('../database/models/index');
var db = require('../database/models/index');
var logger = require('../logger');
var channelJobs= require('./channelJobs');
var moment = require('moment');
const dateFormat = "DD-MM-YYYY HH:mm";
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
            return "error occurred while getting jira link";
        }

    },
}

module.exports = job;
