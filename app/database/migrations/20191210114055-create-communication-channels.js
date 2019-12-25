'use strict';
module.exports = {
  up: (queryInterface, Sequelize) => {
    return queryInterface.createTable('CommunicationChannels', {
      id: {
        allowNull: false,
        primaryKey: true,
        type: Sequelize.STRING
      },
      channel_parameters: {
        type: Sequelize.JSON,
        allowNull: true
      },
      createdAt: {
        allowNull: false,
        type: Sequelize.DATE
      },
      updatedAt: {
        allowNull: false,
        type: Sequelize.DATE
      }
    }).then(() => {
      return queryInterface.bulkInsert('CommunicationChannels', [{
        id: 'email',
        channel_parameters: JSON.stringify({
          "host": "host name",
          "sender": "sender email",
          "user": "user name",
          "password": "password of sender"
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 'team',
        channel_parameters: JSON.stringify({
          webhookURL: 'team channel webhookURL'
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }])
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CommunicationChannels');
  }
};
