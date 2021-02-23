'use strict';
const {
  Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
  class CategorieLivre extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      models.Livre.belongsToMany(models.Categorie, {
        through: models.CategorieLivre,
        foreignKey: 'livre_id',
        otherKey: 'categorie_id'
      });
  
      models.Categorie.belongsToMany(models.Livre, {
        through: models.CategorieLivre,
        foreignKey: 'categorie_id',
        otherKey: 'livre_id',
      });
  
      models.CategorieLivre.belongsTo(models.Livre, {
        foreignKey: 'livre_id',
        as: 'livre',
      });
  
      models.CategorieLivre.belongsTo(models.Categorie, {
        foreignKey: 'categorie_id',
        as: 'categorie',
      });
    }
  };
  
  CategorieLivre.init({
    livre_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'livre',
        key: 'id'
      }
    },

    categorie_id: {
      type: DataTypes.INTEGER,
      references: {
        model: 'categorie',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'CategorieLivre',
    tableName: 'categorieLivre',
    timestamps: false,
  });
  return CategorieLivre;
};