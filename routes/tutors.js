var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Tutor Schema
var tutorSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  matricula: String, 
  email: String,
  grades: Number,
  course: Number,
  campus: String
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

var spacesSchema = new mongoose.Schema({
  campus: String,
  tutors: Number,
  staff: Number
});

var SpacesModel = mongoose.model('Spaces', spacesSchema);

// Get all tutors
router.get("/list", function(req, res, next) {
  TutorModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

// Add new tutor
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

// Edit an existing based on "matricula"
router.post("/edit", function(req, res, next) {
  var tutor = {
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula,
    email: req.body.email,
    grades: req.body.grades,
    course: req.body.course,
    campus: req.body.campus
  };

  TutorModel.findOneAndUpdate({'matricula': req.body.matricula}, 
    tutor,
    {new: true,fields: "name matricula email grades course campus"},
    function(error, result) {
    if (error) {
      res.status(500).send("There was an error updating the document.");
    } else {
      res.status(200).send(result);
    }
  });
});

// Add spaces
router.post("/plazas/edit", function(req, res, next) {
  var plaza = {
    campus: req.body.campus,
    tutors: req.body.tutors,
    staff: req.body.staff
  };

  SpacesModel.findOneAndUpdate({'campus': req.body.campus}, 
    plaza,
    {new:true, fields: "campus tutors staff", upsert:true},
    function(error, result) {
      if (error) {
        res.status(500).send("There was an error updating the document.");
      } else {
        res.status(200).send(result);
      }
    });
});

// Lookup spaces
router.get("/plazas/list", function(req, res, next) {
  SpacesModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

module.exports = router;