'use strict';
module.exports = (sequelize, DataTypes) => {
  const SchedulerTask = sequelize.define('SchedulerTask', {
    cron_exp: DataTypes.STRING,
    active: DataTypes.BOOLEAN,
    channel: DataTypes.STRING,
    timezone: DataTypes.STRING,
    start_date: DataTypes.DATE,
    end_date: DataTypes.DATE,
  }, {});
  SchedulerTask.associate = function (models) {
    SchedulerTask.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
    SchedulerTask.hasMany(models.SchedulerTaskLog, { as: 'shedularlogs', foreignKey: 'SchedulerJobId' });
  };
  return SchedulerTask;
};