var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var http = require('http');

// Tutor Schema
var tutorSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  matricula: String, 
  email: String,
  campus: String,
  average: Number,
  courseGrade: Number,
  isElegible: Boolean,
  isTutor: Boolean,
  materias: Array
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

// Spaces (Plazas de tutores) schema
var spacesSchema = new mongoose.Schema({
  campus: String,
  tutors: Number,
  staff: Number
});

var SpacesModel = mongoose.model('Spaces', spacesSchema);

// ####### TUTOR ROUTES #######

// Get a list of all available tutors
router.get("/list", function(req, res, next) {
  router.checkForCourseGrades();
  TutorModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      res.status(200).send(result);
    }
  });
});

// Creates a new tutor in the db
router.post("/new", function(req, res, next) {
  var newTutor = new TutorModel ({
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula,
    email: req.body.email,
    average: undefined,
    courseGrade: undefined,
    campus: undefined,
    isElegible: false,
    isTutor: false
  });

  // Look for an existing tutor with the same matricula, if it already exists, don't save.
  TutorModel.findOne({'matricula': req.body.matricula}, function(error, response) {
    if (error) {
      res.status(500).send("There was an error on the database.");
    }
    else {
      if (response) {
        res.status(200).send("A user with the same id number already exists.");
      }
      else {
        newTutor.save(function (error) {
          if (error) {
            res.status(500).send("There was an error saving the document.");
          } else {
            res.status(201).send(newTutor);
          }
        });
      }
    }
  });
});

// Edit an existing based on "matricula".
router.post("/edit", function(req, res, next) {
  // more than one object
  if (req.body instanceof Array) {
    var updating = true;
    var i = 0;
    while(updating && i < req.body.length) {
      var element = req.body[i];
      TutorModel.findOneAndUpdate({'matricula': element.matricula}, 
        router.createUpdateObject(element),
        {new: true,fields: "name matricula email average courseGrade campus isElegible isTutor"},
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
      {new: true,fields: "name matricula email average courseGrade campus isElegible isTutor"},
      function(error, result) {
      if (error) {
        res.status(500).send("There was an error updating the document.");
      } else {
        res.status(200).send(result);
      }
    });
  }
});

// Remove
router.post("/remove", function(req, res, next) {
  TutorModel.findOneAndRemove({'matricula' : req.body.matricula}, function(error, response) {
    if (error) {
      res.status(500).send("There was an error removing the element.");
    }
    else {
      res.status(200).send("Successfully removed object.");
    }
  });
});

// ###### PLAZAS ######

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

  // If average, also pre-add isElegible
  if (req.average != null) {
    obj.average = req.average;
    if (parseInt(req.average, 10) >= 85) {
      obj.isElegible = true;
    }
    else {
      obj.isElegible = false;
    }
  }

  if (req.courseGrade != null) {
    obj.courseGrade = req.courseGrade;
  }
  
  if (req.isElegible != null) {
    obj.isElegible = req.isElegible;
  }

  if (req.isTutor != null) {
    obj.isTutor = req.isTutor;
  }

  return obj;
};

router.checkForCourseGrades = function() {
  TutorModel.findOne({'isElegible': true, 'courseGrade': {$exists:false}}, function(error, result) {
    console.log(result);
    if (result) {
      console.log("ya puedo checar califs");
      // Get grades and update db
      var options = {
        host: 'localhost',
        port: '8080',
        path: '/blackboard/grades',
        method: 'GET',
        headers: {
          'Content-Type': 'application/json'
        }
      };

      var getreq = http.request(options, function(res) {
        res.setEncoding('utf8');
        res.on('data', function (chunk) {
          console.log("chunk length: " + chunk.length);
          console.log("chunk:" + chunk);
            if (chunk.length > 2) {
              console.log("ya hay califs");
              router.copyGrades(chunk);
            }
            else {
              console.log("aun no hay califs");
            }
        });
      })
    
      getreq.end();
    }
  })
}

router.copyGrades = function(tutors) {
  var jsonTutors = JSON.parse(tutors);
  console.log("tutor grades:" + jsonTutors);
  for (var i = 0; i < jsonTutors.length; i++) {
    var tutor = {
      matricula: jsonTutors[i].matricula,
      courseGrade: jsonTutors[i].grade,
      isTutor: parseInt(jsonTutors[i].grade)>70 ? true : false
    }

    TutorModel.findOneAndUpdate({'matricula': jsonTutors[i].matricula}, 
      tutor,
      {new: true,fields: "name matricula email average courseGrade campus isElegible isTutor"},
      function(error, result) {
      if (error) {
        console.log("There was an error updating the document.");
      } 
    });
  }
}

module.exports = router;