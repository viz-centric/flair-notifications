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
      threshold_mat: {
        type: Sequelize.BOOLEAN
      },
      email_sent:
      {
        type: Sequelize.BOOLEAN
      },
      team_notification_sent:
      {
        type: Sequelize.BOOLEAN
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