const User = require("../model/schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const session = require("express-session");
const { json } = require("body-parser");
const SECRET_KEY = "AUTHORIZED";
const oneDay = 1000 * 60 * 60 * 24;

//Register controller and token generator
const register = async (req, res) => {
  try {
    console.log(req.body);
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
      console.log("User Added", user);
      req.message = "User registered";
      res.render("login", { message: "User Registered. Please login here!" });
      // res.status(201).json({
      //   user: {
      //     id: user._id,
      //     email: user.email,
      //     nickname: user.nickname,
      //     role: user.role,
      //   },
      //   token: token,
      //   message: "User registered successfully",
      // });
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
  console.log(req.body);
  try {
    const existingUser = await User.findOne({ email: email });
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
    res.cookie("token", token, {
      expires: new Date(Date.now() + oneDay),
      httpOnly: true,
    });
    res.render("profile", {
      name: existingUser.nickname,
      email: existingUser.email,
      role: existingUser.role,
    });

    // res.status(201).json({
    //   user: {
    //     id: existingUser._id,
    //     email: existingUser.email,
    //     nickname: existingUser.nickname,
    //   },
    //   token: token,
    // });
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
      return res.status(400).json({
        message: "User not found",
      });
    } else {
      //token creation
      const recovery_token = jwt.sign(
        { email: user.email, id: user._id },
        SECRET_KEY
      );
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
        subject: "Reset Password",
        text: " Do not share this link.",
        html:
          '<p>Click <a href="http://150.50.1.52:8000/password/reset/' +
          recovery_token +
          '">here</a> to reset your password</p>',
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);
          return res.status(500).json({
            error: "An error occured",
          });
        } else {
          console.log("Email sent" + info.response);
          return res.status(201).json({
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
const resetPassword = async (req, res) => {
  try {
    if (req.body.pass === req.body.cpass) {
      const hashedPassword = await bcrypt.hash(req.body.pass, 10);
      const user = await User.updateOne(
        { _id: req.userId },
        { password: hashedPassword }
      );
      console.log(user);
      console.log("Password changed");
      res.status(201).json({
        message: "Password Changed",
      });
    } else {
      console.log("Password do not match");
      res.status(400).json({
        error: "Password do not match",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      error: "Something went wrong",
    });
  }
};

//fetches nickname of logged in user only
const get_nickname = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      console.log("Nickname:", user.nickname);
      res.status(201).json({
        message: `Your nickname is ${user.nickname}`,
      });
    } else {
      console.log("Error finding user");
      res.status(400).json({
        message: "Error finding user",
      });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

//allows to change nickname -> authorized only to logged in user
const change_nickname = async (req, res) => {
  const new_nickname = req.body.nickname;
  console.log(
    await User.updateOne({ email: req.userEmail }, { nickname: new_nickname })
  );
  res.status(201).json({
    message: `Nickname updated to ${new_nickname}`,
  });
};

//delete user->done by only admin
const delete_user = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.userId });
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      console.log(user);
      if (admin.role === "admin") {
        console.log(
          await User.deleteOne({ email: req.params.email }),
          "\n user deleted"
        );

        res.status(201).json({ message: "User Deleted" });
        res.clearCookie("token");
      } else {
        console.log("Unauthorized to delete");
        res.status(400).json({ error: "Not Authorized to do that" });
      }
    } else {
      console.log("User not found");
      res.status(400).json({ message: "User not found" });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({ error: "Something went wrong!!" });
  }
};

//change the role from user to admin
const change_role = async (req, res) => {
  const user_email = req.params.email;
  const user = await User.findOne({ email: user_email });
  const admin = await User.findOne({ _id: req.userId });
  if (admin.role === "admin") {
    if (user) {
      console.log(
        await User.updateOne({ email: user_email }, { role: "" }),
        "\nUser is authorized as an Admin"
      );
      res.status(201).json({ message: "User is authorized for admin's role" });
    } else {
      console.log("User not found");
      res.status(400).json({ error: "User not found" });
    }
  } else {
    console.log("Unauthorized");
    res.status(400).json({ message: "Not Authorized to do that" });
  }
};

//exporting for further user in other module
module.exports = {
  register,
  login,
  resetEmail,
  resetPassword,
  get_nickname,
  change_nickname,
  delete_user,
  change_role,
};
