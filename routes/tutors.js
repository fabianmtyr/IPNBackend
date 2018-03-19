var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Mongoose
var tutorSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  matricula: String, 
  email: String,
  grades: Number,
  course: Number
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

router.get("/list", function(req, res, next) {
  TutorModel.find({}, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

router.post("/new", function(req, res, next) {
  var newTutor = new TutorModel ({
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula,
    email: req.body.email,
    grades: undefined,
    course: undefined
  });
  newTutor.save(function (err) {
    if (err) {
      console.log("Error on save!");
    } else {
      res.status(201).json(newTutor);
    }
  });
});

module.exports = router;