'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SchedulerTaskMeta', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.BIGINT
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      rawQuery: {
        allowNull: true,
        type: Sequelize.JSON
      },
      viewData: {
        allowNull: true,
        type: Sequelize.STRING
      },
      viewWidget: {
        allowNull: true,
        type: Sequelize.STRING
      },
      SchedulerTaskLogId: {
        type: Sequelize.BIGINT,
        onDelete: 'CASCADE',
        references: {
          model: 'SchedulerTaskLogs',
          key: 'id',
        },
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('SchedulerTaskMeta');
  }
};
