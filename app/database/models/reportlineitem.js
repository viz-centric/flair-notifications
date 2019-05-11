'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReportLineItem = sequelize.define('ReportLineItem', {
    viz_type: DataTypes.STRING,
    visualizationid: DataTypes.STRING,
    dimension: DataTypes.JSON,
    measure: DataTypes.JSON,
    query:{type:DataTypes.JSON,allowNull: false},
  }, {});
  
  ReportLineItem.associate = function(models) {
    ReportLineItem.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return ReportLineItem;
};