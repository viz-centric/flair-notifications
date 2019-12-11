'use strict';
module.exports = (sequelize, DataTypes) => {
    const ChannelConfig = sequelize.define('ChannelConfig    ', {
        communication_channel_id: DataTypes.STRING,
        config: DataTypes.JSON
    }, {});
    ChannelConfig.associate = function (models) {
        ChannelConfig.hasOne(models.CommunicationChannels, { as: 'communication_channel', foreignKey: 'communication_channel_id' }, { onDelete: 'cascade' });
    };
    return ChannelConfig;
};
