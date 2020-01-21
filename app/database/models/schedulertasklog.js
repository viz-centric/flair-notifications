'use strict';
module.exports = (sequelize, DataTypes) => {
  const SchedulerTaskLog = sequelize.define('SchedulerTaskLog', {
    task_executed: DataTypes.DATE,
    task_status: DataTypes.STRING,
    thresholdMet: DataTypes.BOOLEAN,
    notificationSent: DataTypes.BOOLEAN,
    channel: DataTypes.STRING,
    isTicketCreated : DataTypes.BOOLEAN,
    enableTicketCreation: DataTypes.BOOLEAN

  }, {});
  SchedulerTaskLog.associate = function (models) {
    SchedulerTaskLog.hasOne(models.SchedulerTaskMeta, { onDelete: 'cascade' });

    SchedulerTaskLog.belongsTo(models.SchedulerTask, {
      foreignKey: 'SchedulerJobId',
      onDelete: 'CASCADE',
    });
  };
  return SchedulerTaskLog;
};