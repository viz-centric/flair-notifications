'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommunicationChannels = sequelize.define('CommunicationChannels', {
    communication_channel_id:DataTypes.STRING,
    channel_parameters: DataTypes.JSON
  }, {});
  CommunicationChannels.associate = function (models) {
  };
  return CommunicationChannels;
};
