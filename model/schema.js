const mongoose = require("mongoose");
// require("../db/conn");
const validator = require("validator");
const bcrypt = require("bcryptjs");
var salt = bcrypt.genSaltSync(10);

//defining structure
const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      validate(value) {
        if (!validator.isEmail(value)) {
          throw new Error("Email Invalid");
        }
      },
    },
    nickname: {
      type: String,
      // required: true,
      validate(value) {
        if (validator.isEmpty(value)) {
          throw new Error("Nickname is Required");
        }
      },
    },
    password: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      enum: ["user", "admin"],
      default: "user",
    },
    last_logged_in: {
      type: Date,
      default: Date.now,
    },
  },
  { timestamps: true }
);

//creating new collection
const User = new mongoose.model("User", userSchema);

// Exporting collection object
module.exports = User;
