const mongoose = require("mongoose");

const Users = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    unique: true,
    maxlength: [20, "username too long"]
  }
});

module.exports = mongoose.model("Users", Users);
