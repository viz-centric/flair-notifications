'use strict';
module.exports = (sequelize, DataTypes) => {
    const ChannelConfig = sequelize.define('ChannelConfig', {
        communication_channel_id: DataTypes.STRING,
        config: DataTypes.JSON
    }, {});
    ChannelConfig.associate = function (models) {
        ChannelConfig.belongsTo(models.CommunicationChannels, {
            foreignKey: 'communication_channel_id',
            onDelete: 'CASCADE',
        });
    };
    return ChannelConfig;
};
