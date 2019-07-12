'use strict';
module.exports = (sequelize, DataTypes) => {
  const ThresholdAlert = sequelize.define('ThresholdAlert', {
    visualizationid:{
         type:DataTypes.STRING,
         allowNull: false,
         unique: true},
    queryHaving:{type:DataTypes.JSON,allowNull: false}
  }, {});
  
  ThresholdAlert.associate = function(models) {
    ThresholdAlert.belongsTo(models.Report, {
      foreignKey: 'ReportId',
      onDelete: 'CASCADE',
    });
  };
  return ThresholdAlert;
};