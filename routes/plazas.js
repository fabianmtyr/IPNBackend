var express = require('express');
var router = express.Router();
var mongoose = require('mongoose');

// ###### PLAZAS ######
// Plazas de tutores
var plazasSchema = new mongoose.Schema({
  campus: String,
  tutores: Number,
  staff: Number,
  coords: Number
});

var PlazasModel = mongoose.model('Plazas', plazasSchema);

// Edits or creates a new 'plaza'
router.post("/edit", function(req, res, next) {
  var plaza = {
    campus: req.body.campus,
    tutores: req.body.tutores,
    staff: req.body.staff,
    coords: req.body.coords
  };

  PlazasModel.findOneAndUpdate({'campus': req.body.campus}, 
    plaza,
    {new : true, upsert : true},
    function(error, result) {
      if (error) {
        res.status(500).send({"message" : "There was an error saving the document on the database."});
      } else {
        res.status(201).send(result);
      }
    });
});

// Gets a list of all 'plazas'
router.get("/list", function(req, res, next) {
  PlazasModel.find({}, function(error, result) {
    if (error) {
      res.status(500).send({"message" : "There was an error finding the documents."});
    } else {
      res.status(200).send(result);
    }
  });
});

module.exports = router;