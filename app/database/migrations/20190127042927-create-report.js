'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('Reports', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      dashboard_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      view_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      share_link: {
        type: Sequelize.STRING,
        allowNull: true
      },
      report_name: {
        type: Sequelize.STRING,
      },
      subject: {
        type: Sequelize.STRING
      },
      mail_body: {
        type: Sequelize.TEXT
      },
      title_name: {
        type: Sequelize.STRING
      },
      userid: {
        type: Sequelize.STRING
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('Reports');
  }
};
