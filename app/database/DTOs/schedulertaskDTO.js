var moment = require('moment');
var util= require('../../util');

function schedulertaskDTO(schedulerTaskObj) {
  return {
    cron_exp: schedulerTaskObj.cron_exp,
    timezone: schedulerTaskObj.timezone,
    thresholdMet: schedulerTaskObj.thresholdMet,
    notificationSent: schedulerTaskObj.notificationSent,
    ticket: schedulerTaskObj.ticket,
    start_date: moment(schedulerTaskObj.start_date).format(util.dateFormat()),
    end_date: moment(schedulerTaskObj.end_date).format("YYYY-MM-DD")
  }
}

module.exports = schedulertaskDTO;
