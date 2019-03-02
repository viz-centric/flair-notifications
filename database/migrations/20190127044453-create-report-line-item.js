'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('ReportLineItems', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER
      },
      viz_type: {
        type: Sequelize.STRING
      },
      query_name: {
        type: Sequelize.STRING
      },
      fields: {
        type: Sequelize.JSON
      },
      group_by: {
        type: Sequelize.JSON,
        allowNull: true
      },
      order_by: {
        type: Sequelize.JSON,
        allowNull: true
      },
      where: {
        type: Sequelize.STRING,
        allowNull: true
      },
      limit: {
        type: Sequelize.STRING,
        allowNull: true
      },
      table: {
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
      ReportId: {
        type: Sequelize.INTEGER,
        onDelete: 'CASCADE',
        references: {
          model: 'Reports',
          key: 'id',
        },
      },
    });
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('ReportLineItems');
  }
};