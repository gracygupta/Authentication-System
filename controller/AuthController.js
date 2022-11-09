const User = require("../model/schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const SECRET_KEY = "AUTHORIZED";

//Register controller and token generator
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

//Login controller and token generator
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: req.body.email });
    if (!existingUser) {
      return res.status(400).json({
        message: "User not found",
      });
    }
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      return res.status(400).json({
        message: "Invalid Credentials",
      });
    }
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET_KEY
    );
    res.status(201).json({
      user: {
        id: existingUser._id,
        email: existingUser.email,
        nickname: existingUser.nickname,
      },
      token: token,
    });
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: err,
      message: "Something went wrong",
    });
  }
};

//Send email for password reset
const resetEmail = async (req, res) => {
  const { email } = req.body;
  try {
    let user = await User.findOne({ email: req.body.email });
    if (!user) {
      console.log("User not found");
      return res.send(400).json({
        message: "User not found",
      });
    } else {
      let transporter = nodemailer.createTransport({
        service: "gmail",
        auth: {
          user: process.env.EMAIL,
          pass: process.env.PASSWORD,
        },
      });
      var mailOptions = {
        from: process.env.EMAIL,
        to: req.body.email,
        subject: "Sending email",
        text: "Hlo there",
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          res.status(500).json({
            error: "An error occured",
          });
        } else {
          console.log("Email sent" + info.response);
          res.status(201).json({
            status: "success",
            message: "Email sent successfully",
          });
        }
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
};

//Reset password
const resetPassword = async (re, res) => {
  try {
    console.log(req.body);
    const { new_password } = req.body;
    const hashedPassword = await bcrypt.hash(req.body.password, 10);
    console.log(hashedPassword);
    const user = await User.updateOne(
      { email: email },
      { password: hashedPassword }
    );
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
};

//
// const resetPassword = async (re, res) => {};

//exporting for further user in other module
module.exports = { register, login, resetEmail, resetPassword };
