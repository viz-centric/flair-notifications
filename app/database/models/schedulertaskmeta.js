'use strict';
module.exports = (sequelize, DataTypes) => {
  const SchedulerTaskMeta = sequelize.define('SchedulerTaskMeta', {
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
    rawQuery: { type: DataTypes.JSON, allowNull: false },
    viewData: DataTypes.STRING,
    viewWidget: DataTypes.STRING,

  }, {});

  SchedulerTaskMeta.associate = function (models) {

    SchedulerTaskMeta.belongsTo(models.SchedulerTaskLog, {
      foreignKey: 'SchedulerTaskLogId',
      onDelete: 'CASCADE',
    });
  };
  return SchedulerTaskMeta;
};
