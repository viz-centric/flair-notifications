'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReportConstraints = sequelize.define('ReportConstraints', {
    constraints: {type:DataTypes.JSON, allowNull: true},
    createdAt : DataTypes.DATE,
    updatedAt : DataTypes.DATE,
  }, {});
  ReportConstraints.associate = function(models) {
    ReportConstraints.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return ReportConstraints;
};
