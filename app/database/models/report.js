'use strict';
module.exports = (sequelize, DataTypes) => {
  const Report = sequelize.define('Report', {
    dashboard_name: DataTypes.STRING,
    view_name: DataTypes.STRING,
    view_id: DataTypes.BIGINT,
    share_link: DataTypes.TEXT,
    build_url: DataTypes.TEXT,
    report_name: {type:DataTypes.STRING, allowNull: true},
    subject: DataTypes.STRING,
    mail_body: DataTypes.TEXT,
    title_name: DataTypes.STRING,
    userid : DataTypes.STRING,
    thresholdAlert:DataTypes.BOOLEAN
  }, {});
  Report.associate = function(models) {
    Report.hasOne(models.ReportLineItem,{ as: 'reportline', foreignKey: 'ReportId' }, { onDelete: 'cascade' });
    Report.hasOne(models.ReportConstraint,{ foreignKey: 'ReportId' }, { onDelete: 'cascade' });
    Report.hasOne(models.AssignReport, { onDelete: 'cascade' });
    Report.hasOne(models.SchedulerTask, { onDelete: 'cascade' });
  };
  return Report;
};
