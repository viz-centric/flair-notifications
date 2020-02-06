'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.addColumn(
      'Reports',
      'view_id',
      {
        type: Sequelize.BIGINT,
        allowNull: true
      }
    );
  },
  down: (queryInterface, Sequelize) => {
    return queryInterface.removeColumn(
      'Reports',
      'view_id'
    );
  }
};
