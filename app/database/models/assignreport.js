'use strict';
module.exports = (sequelize, DataTypes) => {
  const AssignReport = sequelize.define('AssignReport', {
    communication_list: DataTypes.JSON,
    channel: DataTypes.JSON,
  }, {});
  AssignReport.associate = function(models) {
    AssignReport.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return AssignReport;
};