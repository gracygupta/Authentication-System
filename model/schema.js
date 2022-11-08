const mongoose = require("mongoose");
require("../db/conn");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { json } = require("body-parser");
// const securePassword = async (password) => {
//   const passwordHashed = await bcrypt.hash(password, 10);
//   console.log(passwordHashed);
// };
// const passwordCheck = async (password) => {};

//defining structure
const userSchema = new mongoose.Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  nickname: {
    type: String,
    required: true,
    // validate: [validator.notEmpty, "Email Required"],
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
});

//Hashing
userSchema.pre("save", async function () {
  if (this.isModified("password")) {
    this.password = bcrypt.hash(this.password, 12);
  }
  // next();
});

//creating new collection
const User = new mongoose.model("User", userSchema);

// console.log("hi there");
// User({
//   email: "gracy@123.com",
//   nickname: "gracy",
//   password: "12345678",
//   role: "user",
// }).then(() => {
//   console
//     .log(
//       json({
//         message: "User Registered",
//       })
//     )
//     .catch((e) => {
//       if (!e) {
//         console.log(json({ message: "Error" }));
//       }
//     });
// });
// //Exporting collection object
// module.exports = User;
