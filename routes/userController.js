// Imports
var bcrypt    = require('bcrypt');
var jwtUtils  = require('../utils/jwt.utils');
var models    = require('../models');
var asyncLib  = require('async');
var jwt = require('jsonwebtoken');

// Constants
const EMAIL_REGEX     = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
const PASSWORD_REGEX  = /^(?=.*\d).{4,8}$/;
const JWT_SIGN_SECRET = jwtUtils.JWT_SIGN_SECRET;

// Routes
module.exports = {
  register: function(req, res) {
    
    // Params
    var email    = req.body.email;
    var username = req.body.username;
    var password = req.body.password;
    var isAdmin = req.body.isAdmin;
    //var bio      = req.body.bio;

    if (email == null || username == null || password == null) {
      return res.status(400).json({ 'error': 'Des paramètres sont manquants.'});
    }

    if (username.length >= 13 || username.length <= 4) {
      return res.status(400).json({ 'error': 'Username invalide (longueur doit être comprise entre 5 - 12 catactères).' });
    }

    if (!EMAIL_REGEX.test(email)) {
      return res.status(400).json({ 'error': 'Email invalide.'});
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          attributes: ['email'],
          where: { email: email }
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': 'Impossible de vérifier l utilisateur.' });
        });
      },
      function(userFound, done) {
        if (!userFound) {
          bcrypt.hash(password, 5, function( err, bcryptedPassword ) {
            done(null, userFound, bcryptedPassword);
          });
        } else {
          return res.status(409).json({ 'error': "L'utilisateur existe déjà." });
        }
      },
      function(userFound, bcryptedPassword, done) {
        var newUser = models.User.create({
          email: email,
          username: username,
          password: bcryptedPassword,
          isAdmin: isAdmin
        })
        .then(function(newUser) {
          done(newUser);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': "Impossible d'ajouter l'utilsiateur." });
        });
      }
    ], function(newUser) {
      if (newUser) {
        return res.status(201).json({
          'userId': newUser.id
        });
      } else {
        return res.status(500).json({ 'error': "Impossible d'ajouter l'utilsiateur." });
      }
    });
  },

  login: function(req, res) {
    
    // Params
    var email    = req.body.email;
    var password = req.body.password;

    if (email == null ||  password == null) {
      return res.status(400).json({ 'error': 'Paramètres manquants.' });
    }

    asyncLib.waterfall([
      function(done) {
        models.User.findOne({
          where: { email: email }
        })
        .then(function(userFound) {
          done(null, userFound);
        })
        .catch(function(err) {
          return res.status(500).json({ 'error': "Impossible de vérifier l'utilisateur." });
        });
      },
      function(userFound, done) {
        if (userFound) {
          bcrypt.compare(password, userFound.password, function(errBycrypt, resBycrypt) {
            done(null, userFound, resBycrypt);
          });
        } else {
          return res.status(404).json({ 'error': "L'utilisateur n'existe pas en DB." });
        }
      },
      function(userFound, resBycrypt, done) {
        if(resBycrypt) {
          done(userFound);
        } else {
          return res.status(403).json({ 'error': "Mot de passe invalide." });
        }
      }
    ], function(userFound) {
      if (userFound) {
        return res.status(201).json({
          'userId': userFound.id,
          'token': jwtUtils.generateTokenForUser(userFound)
        });
      } else {
        return res.status(500).json({ 'error': "Impossible de se connecter." });
      }
    });
  },

  amIAuth: function(req, res) {
    var token = req.body.token;

    if (token != null) {

        try {
            var jwtToken = jwt.verify(token, JWT_SIGN_SECRET);
            
            if (jwtToken != null) {
                return res.status(201).json({
                  'isAuth': true
                });
            } else {
              return res.status(400).json({
                'error': "Token invalide"
              });
            }
            
        } catch(err) {
          return res.status(400).json({
            'error': "Token invalide"
          });
        }
    } else {
      return res.status(500).json({
        'error': "Token invalide"
      });
    }
  },
  
}