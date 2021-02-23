'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Livre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Livre.belongsTo(models.User, {
        foreignKey: {
          allowNull: false,
          name: 'user_id'
        }
      });

      models.Livre.belongsToMany(models.Categorie, {
        through: models.CategorieLivre,
        foreignKey: 'livre_id',
        otherKey: 'categorie_id'
      });
    }
  };
  Livre.init({
    titre: DataTypes.TEXT,
    description: DataTypes.TEXT,
    note: DataTypes.FLOAT
  }, {
    sequelize,
    modelName: 'Livre',
    tableName: 'livre'
  });
  return Livre;
};