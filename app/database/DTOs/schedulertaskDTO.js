function schedulertaskDTO(schedulerTaskObj){
    return {
      cron_exp:schedulerTaskObj.cron_exp, 
      timezone:schedulerTaskObj.timezone,
      start_date:schedulerTaskObj.start_date,
      end_date:schedulerTaskObj.end_date
      }
  }

module.exports = schedulertaskDTO;