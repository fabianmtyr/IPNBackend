var express = require("express");
var bodyParser = require("body-parser");
var mongodb = require("mongodb");
var mongoose = require("mongoose");
var ObjectID = mongodb.ObjectID;

var TUTORS = "tutors";
var USERS = "users";

var app = express();
app.use(bodyParser.json());

// Create a database variable outside of the database connection callback to reuse the connection pool in your app.
var db;

// Configs
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/HelloMongoDb';

var theport = process.env.PORT || 8080;

// Connect to the database before starting the application server.
// mongodb.MongoClient.connect(process.env.MONGODB_URI || 'mongodb://localhost/HelloMongoDb', function (err, database) {
//   if (err) {
//     console.log(err);
//     process.exit(1);
//   }

//   // Save database object from the callback for reuse.
//   db = database;
//   console.log("Database connection ready");

//   // Initialize the app.
//   var server = app.listen(process.env.PORT || 8080, function () {
//     var port = server.address().port;
//     console.log("App now running on port", port);
//   });
// });

mongoose.connect(uristring, function (err, res) {
  if (err) {
  console.log ('ERROR connecting to: ' + uristring + '. ' + err);
  } else {
  console.log ('Succeeded connected to: ' + uristring);
  }
});

var server = app.listen(theport, function() {
  var port = server.address().port;
  console.log("App now running on port", port);
});

// CONTACTS API ROUTES BELOW
// Generic error handler used by all endpoints.
function handleError(res, reason, message, code) {
  console.log("ERROR: " + reason);
  res.status(code || 500).json({"error": message});
}

/*  "/api/contacts"
 *    GET: finds all contacts
 *    POST: creates a new contact
 */

app.get("/api/tutors", function(req, res) {
  db.collection(TUTORS).find({}).toArray(function(err, result) {
    if (err) throw err;
    console.log(result);
    res.status(201).json(result);
  });
});

app.post("/api/tutors", function(req, res) {
  var newTutor = req.body;
  db.collection(TUTORS).insertOne(newTutor, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to create new tutor.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});

app.post("/api/login", function(req, res) {

});

app.post("/api/register", function(req, res) {
  var newUser = req.body;
  db.collection(USERS).insertOne(newUser, function(err, doc) {
    if (err) {
      handleError(res, err.message, "Failed to register user.");
    } else {
      res.status(201).json(doc.ops[0]);
    }
  });
});


// Mongoose
var tutorSchema = new mongoose.Schema({
  name: {
    first: String,
    last: String
  },
  matricula: String
});

var TutorModel = mongoose.model('tutors', tutorSchema);

app.get("/mongoose/tutors", function(req, res) {
  TutorModel.find({}, function(err, result) {
    if (err) {
      throw err;
    } else {
      console.log(result);
      res.status(200).json(result);
    }
  });
});

app.post("/mongoose/tutors", function(req, res) {
  console.log("hola");
  var newTutor = new TutorModel ({
    name: {first: req.body.name.first, last: req.body.name.last},
    matricula: req.body.matricula
  });
  newTutor.save(function (err) {
    if (err) {
      console.log("Error on save!");
    } else {
      res.status(201).json(newTutor);
    }
  });
});