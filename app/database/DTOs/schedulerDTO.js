var reportDTO = require('./reportDTO');
var reportlineitemDTO = require('./reportlineitemDTO');
var assignreportDTO = require('./assignreportDTO');
var schedulertaskDTO = require('./schedulertaskDTO');
var queryDTO = require('./queryDTO');

function scedulerDTO(schedulerObj){
    return {
      report:reportDTO(schedulerObj.userid,schedulerObj.dashboard_name,schedulerObj.view_name,schedulerObj.share_link,
      schedulerObj.mail_body,schedulerObj.subject,schedulerObj.report_name,schedulerObj.title_name,schedulerObj.createdAt), 
      report_line_item:reportlineitemDTO(schedulerObj.reportline),
      assign_report:assignreportDTO(schedulerObj.AssignReport),
      schedule:schedulertaskDTO(schedulerObj.SchedulerTask),
      query:JSON.stringify(schedulerObj.reportline.query),
      }
  }

module.exports = scedulerDTO;
