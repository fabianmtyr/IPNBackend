var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// Spaces (Plazas de tutores) schema
var plazasSchema = new mongoose.Schema({
  campus: String,
  tutores: Number,
  staff: Number,
  coords: Number
});

var PlazasModel = mongoose.model('Plazas', plazasSchema);

// ###### PLAZAS ######

// Add spaces
router.post("/edit", function(req, res, next) {
  var plaza = {
    campus: req.body.campus,
    tutores: req.body.tutores,
    staff: req.body.staff,
    coords: req.body.coords
  };

  PlazasModel.findOneAndUpdate({'campus': req.body.campus}, 
    plaza,
    {new:true, fields: "campus tutores staff coords", upsert:true},
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
  PlazasModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send("There was an error finding the documents.");
    } else {
      // console.log(result);
      res.status(200).send(result);
    }
  });
});

module.exports = router;