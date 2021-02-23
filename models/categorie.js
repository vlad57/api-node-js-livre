'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class Categorie extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Categorie.belongsTo(models.User, {
        foreignKey: {
          allowNull: false,
          name: 'user_id'
        }
      });

      models.Categorie.belongsToMany(models.Livre, {
        through: models.CategorieLivre,
        foreignKey: 'categorie_id',
        otherKey: 'livre_id',
      });
    }
  };
  Categorie.init({
    code: DataTypes.STRING,
    titre: DataTypes.TEXT,
    description: DataTypes.TEXT,
    user_id: DataTypes.INTEGER
  }, {
    sequelize,
    modelName: 'Categorie',
    tableName: 'categorie'
  });
  return Categorie;
};