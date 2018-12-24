const express = require("express");
const app = express();
const bodyParser = require("body-parser");

const cors = require("cors");

const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGOLAB_URI || "mongodb://localhost/exercise-track"
);
const Exercise = mongoose.model(
  "Exercise",
  new mongoose.Schema({
    username: {
      type: String,
      required: true,
      unique: true
    },
    log: [{ description: String, duration: Number, date: Date }]
  })
);

app.use(cors());

app.use(bodyParser.urlencoded({ extended: false }));
app.use(bodyParser.json());

app.use(express.static("public"));
app.get("/", (req, res) => {
  res.sendFile(__dirname + "/views/index.html");
});

app.post("/api/exercise/new-user", (req, res) => {
  _createUser(req.body.username)
    .then(data => res.json({ _id: data.id, username: data.username }))
    .catch(err => res.json(err));
});

app.get("/api/exercise/users", (req, res) => {
  _getExercises()
    .then(data => res.json(data))
    .catch(err => res.json(err));
});

app.post("/api/exercise/add", (req, res) => {
  const inputs = ["userId", "description", "duration"];
  for (i in inputs)
    if (Object.keys(req.body).indexOf(inputs[i]) === -1)
      res.json({ error: "Missing inputs " + input[i] });

  _addExercise(req.body.userId, {
    description: req.body.description,
    duration: new Number(req.body.duration),
    date: req.body.date ? new Date(req.body.date) : new Date()
  })
    .then(data =>
      _getExercise(req.body.userId)
        .then(data =>
          res.json({
            username: data.username,
            _id: req.body.userId,
            duration: new Number(req.body.duration),
            description: req.body.description,
            data: req.body.date ? new Date(req.body.date) : new Date()
          })
        )
        .catch(err => res.json(err))
    )
    .catch(err => res.json(err));
});

app.get("/api/exercise/log", (req, res) => {
  req.query.userId
    ? _getExercise(req.query.userId)
        .then(data => {
          let exercises = data.log;
          if (!isNaN(new Date(req.query.from).getTime()))
            exercises = exercises.filter(
              _ => _.date >= new Date(req.query.from)
            );
          if (!isNaN(new Date(req.query.to).getTime()))
            exercises = exercises.filter(_ => _.date <= new Date(req.query.to));
          if (!isNaN(req.query.limit))
            exercises = exercises.slice(0, parseInt(req.query.limit));
          res.json({
            _id: data._id,
            username: data.username,
            count: exercises.length,
            exercises
          });
        })
        .catch(err => res.json(err))
    : res.json({ error: "User ID isn't specified" });
});

// Not found middleware
app.use((req, res, next) => {
  return next({ status: 404, message: "not found" });
});

// Error Handling middleware
app.use((err, req, res, next) => {
  let errCode, errMessage;

  if (err.errors) {
    // mongoose validation error
    errCode = 400; // bad request
    const keys = Object.keys(err.errors);
    // report the first validation error
    errMessage = err.errors[keys[0]].message;
  } else {
    // generic or custom error
    errCode = err.status || 500;
    errMessage = err.message || "Internal Server Error";
  }
  res
    .status(errCode)
    .type("txt")
    .send(errMessage);
});

const listener = app.listen(process.env.PORT || 3000, () => {
  console.log("Your app is listening on port " + listener.address().port);
});

function _createUser(name) {
  return new Exercise({ username: name }).save();
}

function _addExercise(userId, exercise) {
  return Exercise.update({ _id: userId }, { $push: { log: exercise } });
}

function _getExercise(userId) {
  return Exercise.findOne({ _id: userId })
    .select("-__v -log._id")
    .exec();
}

function _getExercises() {
  return Exercise.find({})
    .select("_id username")
    .exec();
}
