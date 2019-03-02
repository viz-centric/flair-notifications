'use strict';
module.exports = (sequelize, DataTypes) => {
  const SchedulerTaskLog = sequelize.define('SchedulerTaskLog', {
    task_executed: DataTypes.DATE,
    task_status: DataTypes.STRING
  }, {});
  SchedulerTaskLog.associate = function(models) {
    SchedulerTaskLog.belongsTo(models.SchedulerTask, {
      foreignKey: 'SchedulerJobId',
      onDelete: 'CASCADE',
    });
  };
  return SchedulerTaskLog;
};