var models = require('./database/models/index');
var shedular= require('./shedular');
var logger= require('./logger');
var retryCount = 1;
var retryDelay=5000; // in miliseconds

exports.restartJobs = function restartOldJobs(){
    
    models.Report.findAll({
        include: [
            {
                model: models.ReportLineItem,
                as: 'reportline',
            },
            {
                model: models.AssignReport,
            },
            {
                model: models.SchedulerTask,
                where: {
                    active:true
                },
            },

        ], 
    }).then(function(reports){
        for (var i=0 ; i< reports.length; i++){

            job=shedular.shedulJob(reports[i].report_name,reports[i].SchedulerTask.cron_exp,
                reports[i].SchedulerTask.start_date,reports[i].SchedulerTask.end_date)
            if (job===null){
                job=shedular.shedulJob(reports[i].report_name,reports[i].SchedulerTask.cron_exp)
            }    

        }
        logger.log({
            level: 'info',
            message: 'rescheduled previous reports',
            total_reports: reports.length,
          });
        }).catch(function(err){
            logger.log({
                level: 'error',
                message: 'database error while rescheduling reports',
                retryCount: retryCount,
              });
            retryCount+=1;
            if (retryCount <= 3){
                setTimeout(restartOldJobs, retryDelay);
                
            }
            else{
                logger.log({
                    level: 'error',
                    message: 'all retry fails while rescheduling reports',
                    retryCount: retryCount,
                  });
            }
        });
}