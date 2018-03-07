var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Mongoose
var tutorSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  matricula: String
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

router.get("/list", function(req, res) {
  TutorModel.find({}, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

router.post("/new", function(req, res) {
  console.log("hola");
  var newTutor = new TutorModel ({
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula
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