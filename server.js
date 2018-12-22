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
    count: Number,
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
    .then(data => res.json(data))
    .catch(err => res.json(err));
});

const _createUser = name =>
  new Promise((reject, resolve) => {
    new Exercise({ username: name })
      .save()
      .then(data => resolve({ _id: data.id, username: data.username }))
      .catch(err => reject(err));
  });

app.get("/api/exercise/users", (req, res) => {
  // TODO: I can get an array of all users by getting api/exercise/users with the same info as when creating a user.
});

app.post("/api/exercise/add", (req, res) => {
  // TODO: I can add an exercise to any user by posting form data userId(_id), description, duration, and optionally date to /api/exercise/add. If no date supplied it will use current date. Returned will the the user object with also with the exercise fields added.
  const { userId, description, duration, count, date } = req.body
  // TODO: Add input checks
  _addExercise(userId, { description, duration, count })
  .then(data => res.json(data))
  .catch(err => res.json(err))
});

const _addExercise = (userId, exercise) =>
  new Promise((reject, resolve) => {
    Exercise.findOneAndUpdate({ _id: userId }, { log: exercise })
      .then(data => resolve(data))
      .catch(err => reject(err));
  });

app.get("/api/exercise/log", (req, res) => {
// TODO: I can retrieve a full exercise log of any user by getting /api/exercise/log with a parameter of userId(_id). Return will be the user object with added array log and count (total exercise count).
// TODO: I can retrieve part of the log of any user by also passing along optional parameters of from & to or limit. (Date format yyyy-mm-dd, limit = int)
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
