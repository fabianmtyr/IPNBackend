var express = require("express");
var bodyParser = require("body-parser");
var mongoose = require("mongoose");

var user = require("./routes/user.js");
var tutors = require("./routes/tutors.js");


var app = express();
app.use(bodyParser.json());

// Configs
var uristring =
    process.env.MONGOLAB_URI ||
    process.env.MONGODB_URI || 
    process.env.MONGOHQ_URL ||
    'mongodb://localhost/ipn';

var theport = process.env.PORT || 8080;

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

// app.use('/', index);
app.use('/tutors', tutors);
app.use('/user', user);

app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", '*');
  res.header("Access-Control-Allow-Credentials", true);
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS');
  res.header("Access-Control-Allow-Headers", 'Origin,X-Requested-With,Content-Type,Accept,content-type,application/json');
  next();
});

app.use(function(_, res, __) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header('Access-Control-Allow-Methods', 'GET,PUT,POST,DELETE,OPTIONS,PATCH');
  res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept, Authorization, Content-Length");
  res.header("Access-Control-Allow-Credentials",  "true");
  
  res.status(404).json("Not found");
});


module.exports = app;