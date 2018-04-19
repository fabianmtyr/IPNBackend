var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var http = require('http');

// Student Schema
var studentSchema = new mongoose.Schema({
  matricula: String,
  grade: Number
});

var StudentModel = mongoose.model('Student', studentSchema);

// Get all grades
router.get("/grades", function(req, res, next) {
  console.log("buscando grades...");
  StudentModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

// Gets list of students and assigns a grade
router.get("/list", function(req, res, next) {
  router.createStudents();
  res.status(201).send();
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

router.createStudents = function() {
  var opts = {
    host: 'localhost',
    port: '8080',
    path: '/tutors/list',
    method: 'GET',
    headers: {
      'Content-Type': 'application/json'
    }
  };
  var getreq = http.request(opts, function(res) {
    res.setEncoding('utf8');
    res.on('data', function (chunk) {
        router.copyMats(chunk);
    });
  })

  getreq.end();
}

router.copyMats = function(tutors) {
  var jsonTutors = JSON.parse(tutors);
  // console.log(jsonTutors);
  for (var i = 0; i < jsonTutors.length; i++) {
    if (jsonTutors[i].isElegible) {
      var student = new StudentModel({
        matricula: jsonTutors[i].matricula,
        grade: Math.random()*41+60
      });
      student.save(function(error) {
        if (error) {
          console.log(error);
        }
      });
    }
  }
}

module.exports = router;