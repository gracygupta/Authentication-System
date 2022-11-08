const User = require("../model/schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const SECRET_KEY = "AUTHORIZED";

const register = async (req, res) => {
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      return res.status(400).json({
        message: "User already exist",
      });
    }
    if (req.body.password === req.body.cpassword) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({
        email: req.body.email,
        nickname: req.body.nickname,
        role: req.body.role,
        password: hashedPassword,
      });
      console.log(user);
      const token = jwt.sign({ email: user.email, id: user._id }, SECRET_KEY);
      res.status(201).json({
        user: {
          id: user._id,
          email: user.email,
          nickname: user.nickname,
          role: user.role,
        },
        token: token,
        message: "User registered successfully",
      });
    } else {
      res.status(400).json({
        message: "Password does not match",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      message: "Something went wrong",
    });
  }
};
const login = (req, res) => {};
module.exports = { register, login };
