class Provider {
  constructor(userStore, exerciseStore) {
    if (!Provider.instance) {
      this.userStore = userStore;
      this.exerciseStore = exerciseStore;
      Provider.instance = this;
    }

    return Provider.instance;
  }

  createUser(name) {
    return new this.userStore({ username: name }).save();
  }

  getUser(userId) {
    return this.userStore.findById({ _id: userId });
  }

  getUsers() {
    return this.userStore.find({});
  }

  addExercise(exercise) {
    if (isNaN(new Date(exercise.date).getDate()))
      exercise.date = new Date().toDateString();
    return this.getUser(exercise.userId)
      .then(user =>
        new this.exerciseStore({ username: user.username, ...exercise })
          .save()
          .then(data => data)
      )
      .catch(err => ({
        status: 400,
        message: "unknown _id"
      }));
  }

  getExercises({ userId, from, to, limit }) {
    const payload = { userId: userId };
    limit = new Number(limit);
    from = new Date(from);
    to = new Date(to);
    const gte = {}
    const lte = {}

    if (!isNaN(from.getDate())) gte.$gte = from.toDateString();
    if (!isNaN(to.getDate())) lte.$lte = to.toDateString();

    return this.exerciseStore
      .find({...payload, date: Object.assign(gte, lte)})
      .sort("date")
      .limit(limit);
  }
}

module.exports = Provider;

// TODO: Delegate provider's job to Schema Entities
