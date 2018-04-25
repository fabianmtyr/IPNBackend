var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');
var nodemailer = require('nodemailer');

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
  esTutor: Boolean,
  materias: Array
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

// // Spaces (Plazas de tutores) schema
// var spacesSchema = new mongoose.Schema({
//   campus: String,
//   tutors: Number,
//   staff: Number
// });

// var SpacesModel = mongoose.model('Spaces', spacesSchema);

// ####### TUTOR ROUTES #######

// Get a list of all available tutors
router.get("/list", function(req, res, next) {
  TutorModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } 
    else {
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
    esTutor: false
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
        {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio esTutor materias"},
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
      {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio esTutor materias"},
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

// // Add spaces
// router.post("/plazas/edit", function(req, res, next) {
//   var plaza = {
//     campus: req.body.campus,
//     tutors: req.body.tutors,
//     staff: req.body.staff
//   };

//   SpacesModel.findOneAndUpdate({'campus': req.body.campus}, 
//     plaza,
//     {new:true, fields: "campus tutors staff", upsert:true},
//     function(error, result) {
//       if (error) {
//         res.status(500).send("There was an error updating the document.");
//       } else {
//         res.status(200).send(result);
//       }
//     });
// });

// // Lookup spaces
// router.get("/plazas/list", function(req, res, next) {
//   SpacesModel.find({}, function(error, result) {
//     if (error) {
//       res.status(500).send("There was an error finding the documents.");
//     } else {
//       // console.log(result);
//       res.status(200).send(result);
//     }
//   });
// });

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

  if (req.esTutor != null) {
    obj.esTutor = req.esTutor;
  }

  if (req.materias != null) {
    obj.materias = req.materias
  }
  console.log("update obj: " + obj);
  return obj;
};

router.get("/updateBb", function(req, res, next) {
  TutorModel.find({'cumplePromedio': true, 'calificacionCurso': {$exists:false}}, function(error, result) {
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        var grade = Math.random()*31+70;
        result[i].calificacionCurso = grade;
        if (grade >= 80) {
          result[i].esTutor = true;
        }
        result[i].save(function(err){
          if (err) {
            res.status(500).send(err);
          }
        });
      }
      res.status(200).send(result);
    } 
    else {
      res.status(200).send("Nada para actualizar.")
    }
  });
});

router.post("/sendMail", function(req, res, next) {
  if (req.body.type == "curso") {
    // send correo para curso
    // get lista de correos
    TutorModel.find({'cumplePromedio' : true}).exec()

    .then(function(tutors) {
      var listaCorreos = [];
      tutors.forEach(function(tutor) {
        listaCorreos.push(tutor.correo);
      });
      return listaCorreos;
    })
    .then(function(correos){
      console.log(correos);
      router.sendMail(correos);
    })
    
    .then(null, next);
  }
  else if (req.body.type == "inscripcion") {
    // send correo para inscripcion
    TutorModel.find({'esTutor' : true}).exec()

    .then(function(tutors) {
      var listaCorreos = [];
      tutors.forEach(function(tutor) {
        listaCorreos.push(tutor.correo);
      });
      return listaCorreos;
    })
    .then(function(correos){
      console.log(correos);
      router.sendMail(correos);
    })
    
    .then(null, next);
  }
});

router.sendMail = function(mailList) {
  if (mailList.length > 0) {
    
    nodemailer.createTestAccount((err, account) => {
      // create reusable transporter object using the default SMTP transport
      let transporter = nodemailer.createTransport({
          host: 'smtp.ethereal.email',
          port: 587,
          secure: false, // true for 465, false for other ports
          auth: {
              user: account.user, // generated ethereal user
              pass: account.pass // generated ethereal password
          }
      });
  
      // setup email data with unicode symbols
      let mailOptions = {
          from: '"PrepaNet" <prepanet@itesm.mx>', // sender address
          to: mailList.toString(), // list of receivers
          subject: 'Hello', // Subject line
          text: 'Hello world?', // plain text body
          html: '<b>Hello world?</b>' // html body
      };
  
      // send mail with defined transport object
      transporter.sendMail(mailOptions, (error, info) => {
          if (error) {
              return console.log(error);
          }
          console.log('Message sent: %s', info.messageId);
          // Preview only available when sending through an Ethereal account
          console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
  
          // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
          // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...
      });
    });
  }
}

module.exports = router;