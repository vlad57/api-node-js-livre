//Imports
var express = require('express');
var cors = require('cors');
var userCtrl = require('./routes/userController');
var categorieCtrl = require('./routes/categorieController');
var livreCtrl = require('./routes/livreController');
//var recetteCtrl = require('./routes/recetteController');

//Router

exports.router = (function() {
    var apiRouter = express.Router();

    apiRouter.options('*', cors());

    // Users routes
    apiRouter.route('/user/register/').post(userCtrl.register);
    apiRouter.route('/user/login/').post(userCtrl.login);
    /*apiRouter.route('/users/me/').get(userCtrl.getUserProfile);
    apiRouter.route('/users/me/').put(userCtrl.updateUserProfile);*/


    // Categorie routes
    apiRouter.route('/categorie/create/').post(categorieCtrl.createCategorie);
    apiRouter.route('/categorie/update/').post(categorieCtrl.updateCategorie);
    apiRouter.route('/categorie/delete/').delete(categorieCtrl.deleteCategorie);
    apiRouter.route('/categorie/list/').get(categorieCtrl.listCategorie);
    apiRouter.route('/categorie/:categorieId/').get(categorieCtrl.getCategorie);


    // Livre routes
    apiRouter.route('/livre/create/').post(livreCtrl.createLivre);
    apiRouter.route('/livre/update/').post(livreCtrl.updateLivre);
    apiRouter.route('/livre/delete/').delete(livreCtrl.deleteLivre);
    apiRouter.route('/livre/list/').get(livreCtrl.listLivre);
    apiRouter.route('/livre/:livreId/').get(livreCtrl.getLivre);

    apiRouter.route('/amIAuth').post(userCtrl.amIAuth);

    return apiRouter;
})();