const router = require("express").Router();
const mongoose = require("mongoose");
mongoose.connect(
  process.env.MONGOLAB_URI || "mongodb://localhost/exercise-track"
);

const Provider = require("./Provider");

const provider = new Provider(require("./Users"), require("./Exercises"));

router.post("/new-user", (req, res) => {
  provider
    .createUser(req.body.username)
    .then(data => res.json({ _id: data.id, username: data.username }))
    .catch(err => res.json(err));
});

router.get("/users", (req, res) => {
  provider
    .getUsers()
    .then(data => res.json(data))
    .catch(err => res.json(err));
});

router.post("/add", (req, res, next) => {
  const inputs = ["userId", "description", "duration"];
  for (i in inputs)
    if (Object.keys(req.body).indexOf(inputs[i]) === -1)
      res.json({ error: "Missing inputs " + input[i] });
  provider
    .addExercise(req.body)
    .then(exercise =>
      res.json({
        username: exercise.username,
        description: exercise.description,
        duration: exercise.duration,
        _id: exercise.userId,
        date: exercise.date.toDateString()
      })
    )
    .catch(err => next(err));
});

router.get("/log", (req, res) => {
  provider
    .getUser(req.query.userId)
    .then(user => {
      provider
        .getExercises(req.query)
        .then(exercises =>
          res.json({
            _id: user._id,
            username: user.username,
            count: exercises.length,
            log: exercises.map(exercise => {
              return {
                description: exercise.description,
                duration: exercise.duration,
                date: exercise.date.toDateString()
              };
            })
          })
        )
        .catch(err => res.json(err));
    })
    .catch(err => res.json(err));
});

module.exports = router;
