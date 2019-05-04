'use strict';
module.exports = (sequelize, DataTypes) => {
  const ReportLineItem = sequelize.define('ReportLineItem', {
    viz_type: DataTypes.STRING,
    query_name: DataTypes.STRING,
    fields:DataTypes.JSON,
    dimension: DataTypes.JSON,
    measure: DataTypes.JSON,
    group_by:{type:DataTypes.JSON,allowNull: true},
    order_by: {type:DataTypes.JSON, allowNull: true},
    where:{type:DataTypes.STRING, allowNull: true},
    limit: {type:DataTypes.STRING,allowNull: true},
    table: DataTypes.STRING
  }, {});
  
  ReportLineItem.associate = function(models) {
    ReportLineItem.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return ReportLineItem;
};