'use strict';
module.exports = (sequelize, DataTypes) => {
    const ChannelConfigs = sequelize.define('ChannelConfigs', {
        communication_channel_id: DataTypes.STRING,
        config: DataTypes.JSON
    }, {});
    ChannelConfigs.associate = function (models) {
        ChannelConfigs.belongsTo(models.CommunicationChannels, {
            foreignKey: 'communication_channel_id',
            onDelete: 'CASCADE',
        });
    };
    return ChannelConfigs;
};
