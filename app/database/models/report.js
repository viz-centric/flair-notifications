'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    dashboard_name: DataTypes.STRING,
    view_name: DataTypes.STRING,
    share_link: DataTypes.STRING,
    build_url: DataTypes.STRING,
    report_name: {type:DataTypes.STRING, allowNull: true},
    subject: DataTypes.STRING,
    mail_body: DataTypes.TEXT,
    title_name: DataTypes.STRING,
    userid : DataTypes.STRING,
    thresholdAlert:DataTypes.BOOLEAN
  }, {});
  Report.associate = function(models) {
    Report.hasOne(models.ReportLineItem,{ as: 'reportline', foreignKey: 'ReportId' }, { onDelete: 'cascade' });
    Report.hasOne(models.AssignReport, { onDelete: 'cascade' });
    Report.hasOne(models.SchedulerTask, { onDelete: 'cascade' });
  };
  return Report;
};
