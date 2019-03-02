'use strict';
module.exports = (sequelize, DataTypes) => {
  const AssignReport = sequelize.define('AssignReport', {
    email_list: DataTypes.JSON,
    channel: DataTypes.STRING,
    condition: DataTypes.STRING
  }, {});
  AssignReport.associate = function(models) {
    AssignReport.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return AssignReport;
};