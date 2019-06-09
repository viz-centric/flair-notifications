const grpc = require("grpc");
const protoLoader = require("@grpc/proto-loader");
const PROTO_PATH = 'app/grpc/Report.proto';
const reportService = require('./../report/reportService');

const reportProto =
    grpc.loadPackageDefinition(
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



function constructReportService(server) {
    server.addService(reportProto.messages.ReportService.service, {
        getScheduledReport: getScheduledReport,
        scheduleReport: scheduleReport,
        getAllScheduledReportsByUser: getAllScheduledReportsByUser,
        getAllScheduledReportsCountsByUser: getAllScheduledReportsCountsByUser,
        updateScheduledReport: updateScheduledReport,
        deleteScheduledReport: deleteScheduledReport
    })
}
function getScheduledReport(_, callback) {

}

function getAllScheduledReportsByUser(_, callback) {

}

function scheduleReport(call, callback) {
    reportService.scheduleReport(call.request).then(
        function(data){
            callback(null, data);
        },function(err){
            callback(null, err);
        }
    ).catch(function (err){
        callback(null, err)
    });

}

function getAllScheduledReportsCountsByUser(_, callback) {

}

function updateScheduledReport(_, callback) {

}

function deleteScheduledReport(_, callback) {

}
