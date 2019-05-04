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
      connection_name: {
        type: Sequelize.STRING,
        allowNull: true
      },
      report_name: {
        type: Sequelize.STRING,
        unique: true,
      },
      subject: {
        type: Sequelize.STRING
      },
      mail_body: {
        type: Sequelize.TEXT
      },
      source_id: {
        type: Sequelize.STRING,
        allowNull: true
      },
      title_name: {
        type: Sequelize.STRING
      },
      userid: {
        type: Sequelize.STRING
      },
      visualizationid: {
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
