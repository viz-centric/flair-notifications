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
        id: 'Email',
        channel_parameters: JSON.stringify({
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
              "displayName": "Port",
              "fieldName": "port",
              "order": 2,
              "fieldType": "Integer",
              "required": true
            },
            {
              "displayName": "User Name",
              "fieldName": "user",
              "order": 3,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "Password",
              "fieldName": "password",
              "order": 4,
              "fieldType": "String",
              "required": true
            }]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }, {
        id: 'Teams',
        channel_parameters: JSON.stringify({
          "connectionProperties": [
            {
              "displayName": "Webhook Name",
              "fieldName": "webhookName",
              "order": 0,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "Webhook URL",
              "fieldName": "webhookURL",
              "order": 1,
              "fieldType": "String",
              "required": true
            }]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      {
        id: 'Jira',
        channel_parameters: JSON.stringify({
          "connectionProperties": [
            {
              "displayName": "Domain Name",
              "fieldName": "organization",
              "order": 0,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "Project Key",
              "fieldName": "key",
              "order": 1,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "User Name",
              "fieldName": "userName",
              "order": 2,
              "fieldType": "String",
              "required": true
            },
            {
              "displayName": "API Token",
              "fieldName": "apiToken",
              "order": 3,
              "fieldType": "String",
              "required": true
            }
          ]
        }),
        createdAt: new Date(),
        updatedAt: new Date()
      }
      ])
    });
  },

  down: (queryInterface, Sequelize) => {
    return queryInterface.dropTable('CommunicationChannels');
  }
};
