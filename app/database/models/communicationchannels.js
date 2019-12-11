'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommunicationChannels = sequelize.define('CommunicationChannels', {
    channel_parameters: DataTypes.JSON
  }, {});
  CommunicationChannels.associate = function (models) {
    CommunicationChannels.hasOne(models.channelconfig, { onDelete: 'cascade' });
  };
  return CommunicationChannels;
};
