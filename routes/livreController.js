// Imports
var models   = require('../models');
var asyncLib = require('async');
var jwtUtils = require('../utils/jwt.utils');
const Sequelize = require('sequelize');
const Op = Sequelize.Op;

module.exports = {

    createLivre: function(req, res) {
        
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        //var code = req.body.categorieCode;
        var title = req.body.livreTitle;
        var description = req.body.livreDescription;
        var note = req.body.livreNote;
        var categorieIds = req.body.categorieIds;

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
                    models.Livre.create({
                        titre: title,
                        description: description,
                        note:note,
                        user_id: userId
                    }).then(function(newLivre) {
                        done(null, newLivre);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.' });
                }
            },
            function(newLivre, done) {

                if (categorieIds && categorieIds.length > 0) {
                    newLivre.setCategories(categorieIds)
                    .then(function(livreCategorie) {
                        done(newLivre, livreCategorie);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    done(newLivre, null);
                }

            }
        ], function(newLivre, livreCategorie) {
            if (newLivre && !livreCategorie || newLivre && livreCategorie) {
                return res.status(200).json({'created': true});
            } else {
                return res.status(404).json({ 'error': 'Livre non créé.'});
            }
        });
    },


    updateLivre: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        
        var livreId = req.body.livreId;
        //var categorieCode = req.body.categorieCode;
        var livreTitle = req.body.livreTitle;
        var livreDescription = req.body.livreDescription;
        var livreNote = req.body.livreNote;
        var categoriesIds = req.body.categorieIds;

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
                    models.Livre.findOne({
                        attributes: ['id'],
                        where: { id: livreId, user_id: userId}
                    }).then(function(getLivre) {
                        done(null, getLivre, userFound);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.' });
                }
            },

            function(getLivre, userFound, done) {
                if (getLivre && userFound) {
    
                    getLivre.update({
                        "titre": livreTitle,
                        "description": livreDescription,
                        "note": livreNote,
                        "userId": userFound.id,
                    }).then(function(livreUpdated) {
                        done(null, livreUpdated);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });

                } else {
                    return res.status(404).json({ 'error': 'Livre non trouvé' });
                }
            },

            function(livreUpdated, done) {

                if (categoriesIds && categoriesIds) {
                    livreUpdated.setCategories(categoriesIds)
                    .then(function(updatedLivreCategorie) {
                        done(livreUpdated, updatedLivreCategorie);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    done(livreUpdated, null);
                }

            }
        ],
        function(livreUpdated, updatedLivreCategorie) {
            if (updatedLivreCategorie && livreUpdated || livreUpdated && !updatedLivreCategorie) {
                return res.status(200).json({ 'success': 'Mise à jour effectuée', 'isUpdated': true });
            } else {
                return res.status(404).json({ 'error': 'Categorie non mise à jour' });
            }
        });
    },

    /*deleteLivreSave: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var livreId = req.body.livreId;


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
                    models.Livre.findOne({
                        attributes: ['id'],
                        where: { id: livreId, user_id: userId }
                    }).then(function(getLivre) {
                        done(null, getLivre);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.'});
                }
            },

            function(getLivre, done) {

                if (getLivre) {

                    models.CategorieLivre.destroy({
                        where: {livre_id : getLivre.id}
                    }).then(function(getRemovedCategorieLivre) {

                        getLivre.destroy({
                        }).then(function(getRemovedLivre) {
                            done(getRemovedLivre);
                        }).catch(function(err) {
                            return res.status(500).json({ 'error': err});
                        });

                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });

                } else {
                    return res.status(404).json({ 'error': 'Livre non trouvé.'});
                }
    
            },
        ], 
        function(getRemovedLivre) {
            if (getRemovedLivre) {
                return res.status(200).json({ 'success': 'Suppression effectuée', 'deleted': true });
            } else {
                return res.status(404).json({ 'error': 'Categorie non supprimée.'});
            }
        });

    },*/


    deleteLivre: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var livreId = req.body.livreId;


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
                    models.Livre.findAll({
                        attributes: ['id'],
                        where: { id: livreId, user_id: userId }
                    }).then(function(getLivre) {
                        done(null, getLivre);
                    }).catch(function(err) {
                        return res.status(500).json({ 'error': err});
                    });
                } else {
                    return res.status(404).json({ 'error': 'Utilisateur introuvable.'});
                }
            },

            function(getLivre, done) {

                if (getLivre) {
                    let removedLivres = [];

                    getLivre.forEach(item => {
                        models.CategorieLivre.destroy({
                            where: {livre_id : item.id}
                        }).then(function(getRemovedCategorieLivre) {
    
                            item.destroy({
                            }).then(function(getRemovedLivre) {
                                removedLivres.push(getRemovedLivre);
                            }).catch(function(err) {
                                console.log(err)
                                return res.status(500).json({ 'error': err});
                            });
    
                        }).catch(function(err) {
                            console.log(err)
                            return res.status(500).json({ 'error': err});
                        });
                    });

                    done(removedLivres);

                } else {
                    return res.status(404).json({ 'error': 'Livre non trouvé.'});
                }
    
            },
        ], 
        function(removedLivres) {
            if (removedLivres) {
                return res.status(200).json({ 'success': 'Suppression effectuée', 'deleted': true });
            } else {
                return res.status(404).json({ 'error': 'Categorie non supprimée.'});
            }
        });

    },


    listLivre: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var limit   = parseInt(req.query.limit);
        var offset  = parseInt(req.query.offset);
        var userIdQuery = parseInt(req.query.userId);

        var totalLivres = 0;

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
                    let whereCond = {};
                    if (userIdQuery) {
                        whereCond = {user_id: userIdQuery};
                    }
                    
                    models.Livre.findAndCountAll({
                        where: whereCond,
                        limit: (!isNaN(limit)) ? limit : null,
                        offset: (!isNaN(offset)) ? offset : null,
                        include: [
                            {
                                model: models.User,
                                attributes: [ 'id', 'username' ]
                            },
                            {
                                model: models.Categorie,
                                attributes: ['code', 'titre', 'description']
                            }
                        ]
                    })
                    .then(function(livres) {

                        let whereCondCount = {};;
                        if (userIdQuery) {
                            whereCondCount = {user_id: userIdQuery};
                        }

                        models.Livre.count({
                            where: whereCondCount
                        }).then(function(counted) {
                            totalLivres = counted;
                            done(livres, totalLivres);
                        });


                        
                    })
                    .catch(function(err) {
                        return res.status(500).json({'error': err});
                    });
    
                }
            }

        ], function(livres, totalLivres) {
            if (livres && totalLivres) {
                return res.status(200).json({'livres': livres, 'totalLivre': totalLivres});
            } else {
                return res.status(200).json('Livres vides.');
            }
        });
    },


    getLivre: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var livreId   = parseInt(req.params.livreId);

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
                models.Livre.findOne({
                    where: {id: livreId},
                    include: [
                        {
                            model: models.User,
                            attributes: [ 'id', 'username' ]
                        },
                        {
                            model: models.Categorie,
                            attributes: ['id', 'titre', 'description', 'code']
                        }
                    ]
                })
                .then(function(livre) {
                    if (livre) {
                        return res.status(200).json(livre);
                    } else {
                        res.status(404).json({'error': "Livre introuvable."})
                    }
                })
                .catch(function(err) {
                    return res.status(500).json({'error': err});
                });
            }
        });
    },


    checkLivretitle: function(req, res) {
        var headerAuth  = req.headers['authorization'];
        var userId = jwtUtils.getUserId(headerAuth);

        var livreId   = parseInt(req.body.livreId);
        var textTitle = req.body.livreTitle;

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

                let whereCond = {
                    titre: {
                        [Op.like]: textTitle
                    }
                };

                if (livreId) {
                    whereCond = {
                        //id: livreId,
                        titre: {
                            [Op.like]: textTitle
                        }
                    }
                }

                models.Livre.findAll({
                    where: whereCond,
                    include: [
                        {
                            model: models.User,
                            attributes: [ 'id', 'username' ]
                        },
                        {
                            model: models.Categorie,
                            attributes: ['id', 'titre', 'description', 'code']
                        }
                    ]
                })
                .then(function(livre) {
                    if (livre) {
                        return res.status(200).json({livre: livre, isEmpty: false});
                    } else {
                        res.status(200).json({isEmpty: true})
                    }
                })
                .catch(function(err) {
                    return res.status(500).json({'error': err});
                });
            }
        });
    }

};