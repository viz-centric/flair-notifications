var models = require('./database/models/index');
var shedular= require('./shedular');
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

            var reports_data={
                report_obj:reports[i],
                report_line_obj :reports[i].reportline,
                report_assign_obj:reports[i].AssignReport,
                report_shedular_obj:reports[i].SchedulerTask
            }
            shedular.shedulJob(reports_data)

        }

        }).catch(function(err){
            console.log('Oops! something went wrong, : ', err);
            console.log('retry count  : ', retryCount);
            retryCount+=1;
            if (retryCount <= 3){
                setTimeout(restartOldJobs, retryDelay);
                
            }
            else{
                console.log('All retry fails ');
            }
        });
}