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
  campus: String,
  hasGrades: Boolean,
  isTutor: Boolean
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
    course: undefined,
    campus: undefined,
    hasGrades: false,
    isTutor: false
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
  // more than one object
  if (req.body instanceof Array) {
    var updating = true;
    var i = 0;
    while(updating && i < req.body.length) {
      var element = req.body[i];
      TutorModel.findOneAndUpdate({'matricula': element.matricula}, 
        router.createUpdateObject(element),
        {new: true,fields: "name matricula email grades course campus hasGrades isTutor"},
        function(error, result) {
        if (error) {
          updating = false;
          res.status(500).send("There was an error updating the document.");
        }
      });
      i = i+1;
    }
    if (updating) {
      res.status(200).send("Updated multiple documents successfully!");
    }
  }
  // just one
  else {
    TutorModel.findOneAndUpdate({'matricula': req.body.matricula}, 
      router.createUpdateObject(req.body),
      {new: true,fields: "name matricula email grades course campus hasGrades isTutor"},
      function(error, result) {
      if (error) {
        res.status(500).send("There was an error updating the document.");
      } else {
        res.status(200).send(result);
      }
    });
  }
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

// Create update object
router.createUpdateObject = function(req) {
  var obj = {};
  if (req.name != null) {
    obj.name = {};
    obj.name.first = req.name.first;
    obj.name.last = req.name.last;
  }

  if (req.matricula != null) {
    obj.matricula = req.matricula;
  }

  if (req.email != null) {
    obj.email = req.email;
  }

  if (req.campus != null) {
    obj.campus = req.campus;
  }

  if (req.grades != null) {
    obj.grades = req.grades;
  }

  if (req.course != null) {
    obj.course = req.course;
  }
  
  if (req.hasGrades != null) {
    obj.hasGrades = req.hasGrades;
  }

  if (req.isTutor != null) {
    obj.isTutor = req.isTutor;
  }

  return obj;
};

module.exports = router;