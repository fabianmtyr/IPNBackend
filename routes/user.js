var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt-nodejs');
var SALT_WORK_FACTOR = 10;

// Mongoose
var userSchema = new mongoose.Schema({
  email: String,
  password: String,
  name: String
});

var UserModel = mongoose.model('User', userSchema);

userSchema.pre('save', function(next){
  var user = this;
  if (!user.isModified('password')) return next;

  bcrypt.genSalt(SALT_WORK_FACTOR, function(err, salt) {
    if (err) return next(err);
    bcrypt.hash(user.password, salt, function(err, hash) {
      if (err) return next(err);

      user.password = hash;
      next();
    });
  });
});

router.post("/register", function(req, res) {
  var newUser = new UserModel ({
    email: req.body.email,
    password: req.body.password,
    name: req.body.name
  });
  newUser.save(function (err) {
    if (err) {
      console.log("Error on save!");
    } else {
      res.status(201).json(newUser);
    }
  });
});

router.post("/login", function(req, res) {
  UserModel.findOne({email: req.body.email}, function(err, user) {
    if (err) {
      throw err;
    } else {
      bcrypt.compare(req.body.password, user.password).then(function(result) {
        res.status(200).json(result);
      });
    }
  });
});

module.exports = router;