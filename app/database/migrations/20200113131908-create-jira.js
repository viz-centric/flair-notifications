'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('JiraTickets', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      projectKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jiraID: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jiraKey: {
        allowNull: false,
        type: Sequelize.STRING
      },
      jiraLink: {
        allowNull: false,
        type: Sequelize.STRING
      },
      schedulerTaskLogsID: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'SchedulerTaskLogs',
          key: 'id',
        },
        allowNull: false
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('JiraTickets');
  }
};
