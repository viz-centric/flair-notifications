'use strict';
module.exports = (sequelize, DataTypes) => {
    const JiraTickets = sequelize.define('JiraTickets', {
        projectKey: DataTypes.STRING,
        jiraID: DataTypes.INTEGER,
        jiraKey: DataTypes.STRING,
        jiraLink: DataTypes.STRING,
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {});
    JiraTickets.associate = function (models) {
        JiraTickets.belongsTo(models.SchedulerTaskMeta, {
            foreignKey: 'schedulerTaskLogsID',
            onDelete: 'CASCADE',
        });
    };
    return JiraTickets;
};