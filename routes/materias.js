var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Spaces (Plazas de tutores) schema
var materiasSchema = new mongoose.Schema({
  clave: String,
  nombre: String
});

var MateriasModel = mongoose.model('Materias', materiasSchema);

// ###### PLAZAS ######

// Add spaces
router.post("/edit", function(req, res, next) {
  var materia = {
    clave: req.body.clave,
    nombre: req.body.nombre
  };

  MateriasModel.findOneAndUpdate({'clave': req.body.clave}, 
    materia,
    {new:true, fields: "clave nombre", upsert:true},
    function(error, result) {
      if (error) {
        res.status(500).send("There was an error updating the document.");
      } else {
        res.status(200).send(result);
      }
    });
});

// Lookup spaces
router.get("/list", function(req, res, next) {
  MateriasModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

module.exports = router;