var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var bcrypt = require('bcrypt');
var SALT_WORK_FACTOR = 10;

// Mongoose
var userSchema = new mongoose.Schema({
  username: String,
  password: String
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
  console.log("registrando");
  var newUser = new UserModel ({
    username: req.body.username,
    password: req.body.password
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
  console.log("login in");
  UserModel.findOne({username: req.body.username}, function(err, user) {
    if (err) {
      throw err;
    } else {
      console.log(user.password);
      console.log(req.body.password)
      bcrypt.compare(req.body.password, user.password).then(function(result) {
        console.log(result);
        res.status(200).json(result);
      });
    }
  });
});

module.exports = router;