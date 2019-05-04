'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    connection_name: DataTypes.STRING,
    report_name: {type:DataTypes.STRING, allowNull: true},
    subject: DataTypes.STRING,
    mail_body: DataTypes.TEXT,
    source_id: {type:DataTypes.STRING, allowNull: true},
    title_name: DataTypes.STRING,
    userid : DataTypes.STRING,
    visualizationid:DataTypes.STRING,
  }, {});
  Report.associate = function(models) {
    Report.hasOne(models.ReportLineItem,{ as: 'reportline', foreignKey: 'ReportId' });
    Report.hasOne(models.AssignReport);
    Report.hasOne(models.SchedulerTask)
  };
  return Report;
};
