var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Student Schema
var studentSchema = new mongoose.Schema({
  matricula: String,
  grade: Number
});

var StudentModel = mongoose.model('Student', studentSchema);

// Get all grades
router.get("/grades", function(req, res, next) {
  StudentModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

// Update averages
router.post("/new", function(req, res, next) {
  var newTutor = new TutorModel ({
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula,
    email: req.body.email,
    grades: undefined,
    course: undefined
  });

  newTutor.save(function (error) {
    if (error) {
      res.status(500).send("There was an error saving the document.");
    } else {
      res.status(201).send(newTutor);
    }
  });
});

router.randomizeGrades = function() {
  
};


module.exports = router;