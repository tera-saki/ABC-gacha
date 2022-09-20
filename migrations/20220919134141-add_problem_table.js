'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('problems', {
      id: {
        type: Sequelize.INTEGER,
        primaryKey: true,
        autoIncrement: true
      },
      index: {
        type: Sequelize.STRING(3),
        allowNull: false
      },
      name: {
        type: Sequelize.STRING,
        allowNull: false,
      },
      diff_level: {
        type: Sequelize.INTEGER
      },
      contest_id: {
        type: Sequelize.INTEGER,
        references: {
          model: 'contests',
          key: 'id'
        },
        onUpdate: 'CASCADE',
        onDelete: 'CASCADE'
      },
      created_at: {
        type: Sequelize.DATE
      },
      updated_at: {
        type: Sequelize.DATE
      },
    })
    await queryInterface.addConstraint('problems', {
      fields: ['contest_id', 'index'],
      type: 'unique'
    })
  },

  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('problems')
  }
};
