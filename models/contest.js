'use strict';

module.exports = (sequelize, DataTypes) => {
  const Contest = sequelize.define('contest', {
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    rated: {
      type: DataTypes.BOOLEAN,
      defaultValue: true
    }
  }, {
    underscored: true
  })
  Contest.associate = (models) => {
    models.contest.hasMany(models.problem, { foreignKey: 'contest_id', sourceKey: 'id' })
  }
  return Contest
};