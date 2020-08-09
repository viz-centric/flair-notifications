const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = 'app/grpc/ReportService.proto';
const reportService = require('./../report/reportService');
const auth = require('../auth')

const reportProto = grpc.loadPackageDefinition(
    protoLoader.loadSync(PROTO_PATH, {
        keepCase: true,
        longs: String,
        enums: String,
        defaults: true,
        oneofs: true
    })
);

module.exports =
    [
        constructReportService
    ];


async function handleCall(func, call, callback) {
    const authorization = call.metadata.get('Authorization')[0];
    const jwtResult = await auth.decodeAuth(authorization);
    return func(call, jwtResult).then(function (data) {
        callback(null, data);
    }).catch(function (err) {
        callback(null, err)
    });
}

function constructReportService(server) {
    server.addService(reportProto.messages.reports.ReportService.service, {
        getScheduledReport,
        scheduleReport,
        getAllScheduledReportsByUser,
        getAllScheduledReportsCountsByUser,
        updateScheduledReport,
        deleteScheduledReport,
        getScheduleReportLogs,
        getScheduleReportLog,
        executeReport,
        searchReports,
        addTeamConfigs,
        addEmailConfigs,
        updateEmailSMTP,
        UpdateTeamWebhookURL,
        getChannelProperties,
        deleteChannelConfig,
        getTeamConfig,
        getTeamNames,
        getEmailConfig,
        AddJiraConfigs,
        updateJiraConfigs,
        getJiraConfig,
        createJiraTicket,
        getAllJira,
        disableTicketCreation,
        notifyOpenedJiraTicket,
        isConfigExist
    })
}

function searchReports(call, callback) {
    handleCall(reportService.searchReports, call, callback);
}

function executeReport(call, callback) {
    handleCall(reportService.executeReport, call, callback);
}

function getScheduleReportLogs(call, callback) {
    handleCall(reportService.getScheduleReportLogs, call, callback);
}

function getScheduleReportLog(call, callback) {
    handleCall(reportService.getScheduleReportLog, call, callback);
}

function getScheduledReport(call, callback) {
    handleCall(reportService.getScheduledReport, call, callback);
}

function getAllScheduledReportsByUser(call, callback) {
    handleCall(reportService.getAllScheduledReportForUser, call, callback);
}

function scheduleReport(call, callback) {
    handleCall(reportService.scheduleReport, call, callback);
}

function getAllScheduledReportsCountsByUser(call, callback) {
    handleCall(reportService.getScheduledReportCountsForUser, call, callback);
}

function updateScheduledReport(call, callback) {
    handleCall(reportService.updateScheduledReport, call, callback);
}

function deleteScheduledReport(call, callback) {
    handleCall(reportService.deleteScheduledReport, call, callback);
}

function addTeamConfigs(call, callback) {
    handleCall(reportService.addTeamConfigs, call, callback);
}

function addEmailConfigs(call, callback) {
    handleCall(reportService.addEmailConfigs, call, callback);
}

function getChannelProperties(call, callback) {
    handleCall(reportService.getChannelProperties, call, callback);
}

function deleteChannelConfig(call, callback) {
    handleCall(reportService.deleteChannelConfig, call, callback);
}


function updateEmailSMTP(call, callback) {
    handleCall(reportService.updateEmailSMTP, call, callback);
}

function UpdateTeamWebhookURL(call, callback) {
    handleCall(reportService.updateTeamWebhookURL, call, callback);
}

function getEmailConfig(call, callback) {
    handleCall(reportService.getEmailConfig, call, callback);
}

function getTeamConfig(call, callback) {
    handleCall(reportService.getTeamConfig, call, callback);
}

function getTeamNames(call, callback) {
    handleCall(reportService.getTeamNames, call, callback);
}

function AddJiraConfigs(call, callback) {
    handleCall(reportService.AddJiraConfigs, call, callback);
}

function updateJiraConfigs(call, callback) {
    handleCall(reportService.updateJiraConfiguration, call, callback);
}

function getJiraConfig(call, callback) {
    handleCall(reportService.getJiraConfig, call, callback);
}

function createJiraTicket(call, callback) {
    handleCall(reportService.createJiraTicket, call, callback);
}

function getAllJira(call, callback) {
    handleCall(reportService.getAllJira, call, callback);
}

function disableTicketCreation(call, callback){
    handleCall(reportService.disableTicketCreation, call, callback);
}

function notifyOpenedJiraTicket(call, callback){
    handleCall(reportService.notifyOpenedJiraTicket, call, callback);
}

function isConfigExist(call, callback){
    handleCall(reportService.isConfigExist, call, callback);
}