'use strict';

module.exports = (sequelize, DataTypes) => {
  const Problem = sequelize.define('problem', {
    index: {
      type: DataTypes.STRING(3),
      allowNull: false
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false
    },
    diff_level: {
      type: DataTypes.INTEGER,
    },
    contest_id: {
      type: DataTypes.INTEGER,
    }
  }, {
    underscored: true
  })
  Problem.associate = (models) => {
    models.problem.belongsTo(models.contest, { foreignKey: 'contest_id', targetKey: 'id' })
  }
  return Problem
};