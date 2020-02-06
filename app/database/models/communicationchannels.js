'use strict';
module.exports = (sequelize, DataTypes) => {
  const CommunicationChannels = sequelize.define('CommunicationChannels', {
    id: {
      type: DataTypes.STRING,
      primaryKey: true
    },
    channel_parameters: DataTypes.JSON
  }, {});
  CommunicationChannels.associate = function (models) {
    CommunicationChannels.hasOne(models.ChannelConfigs, { as: 'ChannelConfigs', foreignKey: 'communication_channel_id' }, { onDelete: 'cascade' });

  };
  return CommunicationChannels;
};
