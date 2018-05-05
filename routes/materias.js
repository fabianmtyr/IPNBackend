var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// ###### MATERIAS ######
var materiasSchema = new mongoose.Schema({
  clave: String,
  nombre: String,
  periodo: String
});

var MateriasModel = mongoose.model('Materias', materiasSchema);

// Edits/Adds a new 'materia'
router.post("/edit", function(req, res, next) {
  var materia = {
    clave: req.body.clave,
    nombre: req.body.nombre,
    periodo: req.body.periodo
  };

  MateriasModel.findOneAndUpdate({'clave': req.body.clave}, 
    materia,
    {new:true, upsert:true},
    function(error, result) {
      if (error) {
        res.status(500).send({"message" : "There was an error saving the document on the database."});
      } else {
        res.status(201).send(result);
      }
    });
});

// Gets a list of all 'materias'
router.get("/list", function(req, res, next) {
  MateriasModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send({"message" : "There was an error finding the documents."});
    } else {
      res.status(200).send(result);
    }
  });
});

// Remove
router.post("/remove", function(req, res, next) {
  MateriasModel.findOneAndRemove({'clave' : req.body.clave}, function(error, response) {
    if (error) {
      res.status(500).send("There was an error removing the element.");
    }
    else {
      res.status(200).send("Successfully removed object.");
    }
  });
});

module.exports = router;