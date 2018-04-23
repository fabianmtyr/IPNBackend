var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var http = require('http');

// Tutor Schema
var tutorSchema = new mongoose.Schema({
  nombre: {
    nombre: String,
    apellido: String
  },
  matricula: String, 
  correo: String,
  campus: String,
  carrera: String,
  semestre: String, 
  promedio: Number,
  calificacionCurso: Number,
  cumplePromedio: Boolean,
  pasoCurso: Boolean,
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
    nombre: {nombre: req.body.nombre.nombre, apellido: req.body.nombre.apellido},
    matricula: req.body.matricula,
    correo: req.body.correo,
    promedio: undefined,
    calificacionCurso: undefined,
    campus: undefined,
    semestre: undefined,
    carrera: undefined,
    cumplePromedio: false,
    pasoCurso: false
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
        {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio pasoCurso"},
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
      {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio pasoCurso"},
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
  console.log("req body : " + req.body);
  if (req.nombre != null) {
    obj.nombre = {};
    obj.nombre.nombre = req.nombre.nombre;
    obj.nombre.apellido = req.nombre.apellido;
  }

  if (req.matricula != null) {
    obj.matricula = req.matricula;
  }

  if (req.correo != null) {
    obj.correo = req.correo;
  }

  if (req.campus != null) {
    obj.campus = req.campus;
  }

  if (req.semestre != null) {
    obj.semestre = req.semestre;
  }

  if (req.carrera != null) {
    obj.carrera = req.carrera;
  }

  // If average, also pre-add isElegible
  if (req.promedio != null) {
    obj.promedio = req.promedio;
    if (parseInt(req.promedio, 10) >= 85) {
      obj.cumplePromedio = true;
    }
    else {
      obj.cumplePromedio = false;
    }
  }

  if (req.calificacionCurso != null) {
    obj.calificacionCurso = req.calificacionCurso;
  }
  
  if (req.cumplePromedio != null) {
    obj.cumplePromedio = req.cumplePromedio;
  }

  if (req.pasoCurso != null) {
    obj.pasoCurso = req.pasoCurso;
  }
  console.log("update obj: " + obj);
  return obj;
};

router.checkForCourseGrades = function() {
  TutorModel.find({'cumplePromedio': true, 'calificacionCurso': {$exists:false}}, function(error, result) {
    console.log(result);
    if (result.length > 0) {
      console.log("ya puedo checar califs");

      for (var i = 0; i < result.length; i++) {
        var grade = Math.random()*31+70;
        result[i].calificacionCurso = grade;
        if (grade >= 80) {
          result[i].pasoCurso = true;
        }
        console.log(result[i]);
        result[i].save(function(err){
          if (err) {
            console.log(err);
          }
          else {
            console.log("si se grabo");
          }
        });
      }
      // Get grades and update db
      // var options = {
      //   host: 'https://ipn-backend.herokuapp.com',
      //   port: process.env.PORT,
      //   path: '/blackboard/grades',
      //   method: 'GET',
      //   headers: {
      //     'Content-Type': 'application/json'
      //   }
      // };

      // var getreq = http.request(options, function(res) {
      //   res.setEncoding('utf8');
      //   res.on('data', function (chunk) {
      //     console.log("chunk length: " + chunk.length);
      //     console.log("chunk:" + chunk);
      //       if (chunk.length > 2) {
      //         console.log("ya hay califs");
      //         router.copyGrades(chunk);
      //       }
      //       else {
      //         console.log("aun no hay califs");
      //       }
      //   });
      // });
      // getreq.end();

    }
  });
}

// router.copyGrades = function(tutors) {
//   var jsonTutors = JSON.parse(tutors);
//   console.log("tutor grades:" + jsonTutors);
//   for (var i = 0; i < jsonTutors.length; i++) {
//     var tutor = {
//       matricula: jsonTutors[i].matricula,
//       calificacionCurso: jsonTutors[i].grade,
//       pasoCurso: parseInt(jsonTutors[i].grade)>70 ? true : false
//     }

//     TutorModel.findOneAndUpdate({'matricula': jsonTutors[i].matricula}, 
//       tutor,
//       {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio pasoCurso"},
//       function(error, result) {
//       if (error) {
//         console.log("Hubo un error al editar los documentos.");
//       } 
//     });
//   }
// }

module.exports = router;