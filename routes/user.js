var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

// Mongoose
var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String,
  campus: String
});

var UserModel = mongoose.model('User', userSchema);

// Encrypts password
userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) return next;

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, null, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

// Adds new user
router.post("/register", function(req, res, next) {
  var newUser = new UserModel ({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name,
    campus: req.body.campus
  });

  newUser.save(function (error) {
    if (error) {
      res.status(500).send("There was an error saving the new user.");
    } else {
      res.status(201).send(newUser);
    }
  });
});

// Log in
router.post("/login", function(req, res, next) {
  var userobj = {
    email: false,
    password: false,
    name: "",
    campus: ""
  };
  UserModel.findOne({'email': req.body.email}, function(err, user) {
    if (err) {
      res.status(500).send("Error on find");
    } else {
      if (user) {
        userobj.email = true;
        userobj.name = user.name;
        userobj.campus = user.campus;
        bcrypt.compare(req.body.password, user.password, function(error, result) {
          userobj.password = result;
          res.status(200).send(userobj);
        });
      }
      else {
        res.status(200).send(userobj);
      }
    }
  });
});

module.exports = router;