'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('SchedulerTaskLogs', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      task_executed: {
        type: Sequelize.DATE
      },
      task_status: {
        type: Sequelize.STRING
      },
      thresholdMet: {
        type: Sequelize.BOOLEAN
      },
      notificationSent:
      {
        type: Sequelize.BOOLEAN
      },
      channel: {
        type: Sequelize.STRING
      },
      ticket: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      SchedulerJobId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'SchedulerTasks',
          key: 'id',
        },
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('SchedulerTaskLogs');
  }
};