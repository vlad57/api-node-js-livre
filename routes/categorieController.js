// Imports
var models   = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');

module.exports = {
    createCategorie: function(req, res) {
        
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var code = req.body.categorieCode;
        var title = req.body.categorieTitle;
        var description = req.body.categorieDescription;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                  where: { id: userId }
                })
                .then(function(userFound) {
                  done(null, userFound);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'Impossible de vérifier l utilisateur.' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Categorie.create({
                        code: code,
                        titre: title,
                        description: description,
                        user_id: userId
                    }).then(function(newCategorie) {
                        done(newCategorie);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.' });
                }
            }
        ], function(newCategorie) {
            if (newCategorie) {
                return res.status(200).json({'created': true});
            } else {
                return res.status(404).json({ 'error': 'Categorie non créée.'});
            }
        });
    },

    updateCategorie: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        
        var categorieId = req.body.categorieId;
        var categorieCode = req.body.categorieCode;
        var categorieTitle = req.body.categorieTitle;
        var categorieDescription = req.body.categorieDescription;

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                  where: { id: userId }
                })
                .then(function(userFound) {
                  done(null, userFound);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'Impossible de vérifier l utilisateur.' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Categorie.findOne({
                        attributes: ['id'],
                        where: { id: categorieId, user_id: userId}
                    }).then(function(getCategorie) {
                        done(null, getCategorie, userFound);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.' });
                }
            },

            function(getCategorie, userFound, done) {
                if (getCategorie && userFound) {
    
                    var categorieUpdated = getCategorie.update({
                        "code": categorieCode,
                        "titre": categorieTitle,
                        "description": categorieDescription,
                        "userId": userFound.id
                    });
    
                    done(categorieUpdated)
                } else {
                    return res.status(404).json({ 'error': 'Categorie non trouvée.' });
                }
            }

        ],
        function(categorieUpdated) {
            if (categorieUpdated) {
                return res.status(200).json({ 'success': 'Mise à jour effectuée', 'isUpdated': true });
            } else {
                return res.status(404).json({ 'error': 'Categorie non mise à jour' });
            }
        });
    },


    deleteCategorie: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var categorieId = req.body.categorieId;


        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                  where: { id: userId }
                })
                .then(function(userFound) {
                  done(null, userFound);
                })
                .catch(function(err) {
                  return res.status(500).json({ 'error': 'Impossible de vérifier l utilisateur.' });
                });
            },
            function(userFound, done) {
                if (userFound) {
                    models.Categorie.findOne({
                        attributes: ['id'],
                        where: { id: categorieId, user_id: userId }
                    }).then(function(getCategorie) {
                        done(null, getCategorie);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.'});
                }
            },

            function(getCategorie, done) {

                if (getCategorie) {

                    models.CategorieLivre.destroy({
                        where: {categorie_id : getCategorie.id}
                    }).then(function(getRemoveCategorieLivre) {

                        getCategorie.destroy({
                        }).then(function(getRemoveCategorie) {
                            done(getRemoveCategorie);
                        }).catch(function(err) {
                            return res.status(500).json({ 'error': err});
                        });

                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });

                } else {
                    return res.status(404).json({ 'error': 'Catégorie non trouvée.'});
                }
    
            },
        ], 
        function(getRemoveCategorie) {
            if (getRemoveCategorie) {
                return res.status(200).json({ 'success': 'Suppression effectuée', 'deleted': true });
            } else {
                return res.status(404).json({ 'error': 'Categorie non supprimée.'});
            }
        });

    },

    listCategorie: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var limit   = parseInt(req.query.limit);
        var offset  = parseInt(req.query.offset);

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: {id: userId}
                }).then(function(userFound) {
                    done(null, userFound);
                }).catch(function(err) {
                    return res.status(500).json({'error': "Impossible de vérifier l'utilisateur."});
                });
            },

            function(userFound, done) {
                if (userFound) {
                    models.Categorie.findAndCountAll({
                        where: {user_id: userId},
                        limit: (!isNaN(limit)) ? limit : null,
                        offset: (!isNaN(offset)) ? offset : null,
                        include: [
                            {
                                model: models.User,
                                attributes: [ 'id', 'username' ]
                            },
                            {
                                model: models.Livre,
                                attributes: ['note', 'titre', 'description']
                            }
                        ]
                    })
                    .then(function(categories) {
                        done(categories);
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error': err});
                    });
    
                }
            }

        ], function(categories) {
            if (categories) {
                return res.status(200).json({'categories': categories});
            } else {
                return res.status(404).json({'error': "Catégories introuvables."});
            }
        });
    },


    getCategorie: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var categorieId   = parseInt(req.params.categorieId);

        asyncLib.waterfall([
            function(done) {
                models.User.findOne({
                    where: {id: userId}
                }).then(function(userFound) {
                    done(userFound);
                }).catch(function(err) {
                    return res.status(500).json({'error': 'Unable to verify user'});
                });
            }
        ], function(userFound) {
            if (userFound) {
                models.Categorie.findOne({
                    where: {id: categorieId, user_id: userId},
                    include: [
                        {
                            model: models.User,
                            attributes: [ 'id', 'username' ]
                        },
                        {
                            model: models.Livre,
                            attributes: ['id', 'titre', 'description', 'note']
                        }
                    ]
                })
                .then(function(categorie) {
                    if (categorie) {
                        return res.status(200).json(categorie);
                    } else {
                        res.status(404).json({'error': "Categorie introuvable."})
                    }
                })
                .catch(function(err) {
                    return res.status(500).json({'error': err});
                });
            }
        });
    },
}