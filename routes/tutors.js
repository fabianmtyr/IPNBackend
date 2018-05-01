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
  materias: Array,
  periodo: String
});

var TutorModel = mongoose.model('Tutors', tutorSchema);

// ####### TUTOR ROUTES #######

// Get a list of all available tutors
router.get("/list", function(req, res, next) {
  TutorModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send({"message" : "There was an error finding the documents."});
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
    campus: req.body.campus,
    semestre: undefined,
    carrera: undefined,
    cumplePromedio: false,
    esTutor: false,
    materias: req.body.materias,
    periodo: undefined
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
        {new: true,fields: "nombre matricula correo promedio calificacionCurso campus semestre carrera cumplePromedio esTutor materias periodo"},
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
      {new: true},
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

router.get("/updateBb", function(req, res, next) {
  TutorModel.find({'cumplePromedio': true, 'calificacionCurso': {$exists:false}}, function(error, result) {
    if (result.length > 0) {
      for (var i = 0; i < result.length; i++) {
        var grade = Math.round(Math.random()*31+70);
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

// SEND MAIL: Sends email to specified tutors.
router.post("/sendMail", function(req, res, next) {
  // Get type of email to send
  var field = '';
  if (req.body.type == "curso"){
    field = 'cumplePromedio';
  }
  else if (req.body.type == "inscripcion") {
    field = 'esTutor';
  }
  else {
    res.status(500).send({"message" : "No se puede mandar un email del tipo " + req.body.type});
  }

  // Find all tutors with that field set to true
  TutorModel.find({[field] : true, 'campus' : { $in : req.body.campus} }).exec()
  .then((tutors) => {
    // Get all email addresses in an array
    var emailList = [];
    tutors.forEach(function(tutor) {
      emailList.push(tutor.correo);
    });
    return emailList;
  })
  .then((correos) => {
    // Send email
    if (correos.length > 0) {
      /***** ACTION NEEDED *****
        Test account used here, this needs to be replaced with a real account and password
          which will be the sender of the email. */
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
        
        /***** ACTION NEEDED *****
          Needs to be replaced with text of email. */
        let mailOptions = {
            from: '"PrepaNet" <prepanet@itesm.mx>', // sender address
            to: correos.toString(), // list of receivers
            subject: 'Hello', // Subject line
            text: 'Hello world?', // plain text body
            html: '<b>Hello world?</b>' // html body
        };
    
        // Send mail with transport object
        transporter.sendMail(mailOptions, (error, info) => {
            if (error) {
                res.status(500).send({"message" : error});
            }
            /***** ACTION NEEDED *****
              This needs to be removed and response message needs to change. */
            console.log('Message sent: %s', info.messageId);
            // Preview only available when sending through an Ethereal account
            console.log('Preview URL: %s', nodemailer.getTestMessageUrl(info));
            // Message sent: <b658f8ca-6296-ccf4-8306-87d57a0b4321@example.com>
            // Preview URL: https://ethereal.email/message/WaQKMgKddxQDoou...

            res.status(200).send({"message" : nodemailer.getTestMessageUrl(info)});
        });
      });
    }
    else {
      res.status(200).send({"message" : "No hay candidatos que cumplan con el requisito para enviar correo."});
    }
  })
  .then(null, next);
});

// QUERIES
// Quien pasó curso
router.get("/queries/aprobados", function(req, res, next) {
  TutorModel.find({
    'calificacionCurso' : { $gt : 80 }
  })
  .sort('-calificacionCurso')
  .select('matricula calificacionCurso esTutor')
  .exec()
  .then((tutors) => {
    res.status(200).send(tutors);
  })
  .catch((err) => {
    res.status(500).send(err);
  })
  .then(null, next);
});

// Materias seleccionadas de quienes si pasaron
router.get("/queries/materias", function(req, res, next) {
  TutorModel.find({
    'materias' : { $ne : null },
    'calificacionCurso' : { $gt : 80 }
  })
  .sort('-calificacionCurso')
  .select('matricula calificacionCurso materias')
  .exec()
  .then((tutors) => {
    res.status(200).send(tutors);
  })
  .catch((err) => {
    res.status(500).send(err);
  })
  .then(null, next);
});

// Reporte de promedios
router.get("/queries/promedios", function(req, res, next) {
  TutorModel.find()
  .sort('-promedio')
  .select('matricula promedio cumplePromedio')
  .exec()
  .then((tutors) => {
    res.status(200).send(tutors);
  })
  .catch((err) => {
    res.status(500).send(err);
  })
  .then(null, next);
});

// HELPERS

// Create update object
router.createUpdateObject = function(req) {
  var obj = {};
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
    obj.materias = req.materias;
  }

  if (req.periodo != null) {
    obj.periodo = req.periodo;
  }
  return obj;
};


module.exports = router;