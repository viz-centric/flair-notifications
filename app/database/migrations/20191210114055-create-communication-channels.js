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
          "id": "Email",
          "connectionProperties": [
            {
              "displayName": "Host Name",
              "fieldName": "host",
              "order": 0,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "Sender Email",
              "fieldName": "sender",
              "order": 1,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "User Name",
              "fieldName": "user",
              "order": 2,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "Password",
              "fieldName": "password",
              "order": 3,
              "fieldType": "String",
              "required": true
            }]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 'team',
        channel_parameters: JSON.stringify({
          "id": "Teams",
          "connectionProperties": [
            {
              "displayName": "Webhook URL",
              "fieldName": "webhook",
              "order": 0,
              "fieldType": "String",
              "required": true
            }]
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
