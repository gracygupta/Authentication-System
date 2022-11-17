const User = require("../model/schema");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const nodemailer = require("nodemailer");
const { json } = require("body-parser");
const SECRET_KEY = process.env.SECRET_KEY;
const oneDay = 1000 * 60 * 60 * 24;
const api = process.env.api;

//Register controller and token generator
const register = async (req, res) => {
  try {
    console.log(req.body);
    const existingUser = await User.findOne({ email: req.body.email });
    if (existingUser) {
      if (api === true) {
        return res.status(400).json({
          message: "User already exist",
        });
      } else {
        res.render("error", {
          message_1: "OOPS!",
          message_2: "User already exist",
          brace: "(",
        });
      }
    }
    if (req.body.password === req.body.cpassword) {
      const hashedPassword = await bcrypt.hash(req.body.password, 10);
      const user = await User.create({
        email: req.body.email,
        nickname: req.body.nickname,
        role: req.body.role,
        password: hashedPassword,
      });
      console.log("User Added");
      if (api === true) {
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
        res.redirect("/login?message=User Registered. Please login here!");
      }
    } else {
      if (api === true) {
        res.status(400).json({
          message: "Password does not match",
        });
      } else {
        res.render("error", {
          message_1: "SORRY!",
          message_2: "Password do not match",
          brace: "(",
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.status(500).json({
        error: err,
        message: "Something went wrong",
      });
    } else {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    }
  }
};

//Login controller and token generator
const login = async (req, res) => {
  const { email, password } = req.body;
  try {
    const existingUser = await User.findOne({ email: email });
    if (!existingUser) {
      if (api === true) {
        return res.status(400).json({
          message: "User not found",
        });
      } else {
        res.render("error", {
          message_1: "OOPS!",
          message_2: "User not found",
          brace: "(",
        });
      }
    }
    const matchPassword = await bcrypt.compare(password, existingUser.password);
    if (!matchPassword) {
      if (api === true) {
        return res.status(400).json({
          message: "Invalid Credentials",
        });
      } else {
        res.render("error", {
          message_1: "SORRY!",
          message_2: "Invalid Credentials",
          brace: "(",
        });
      }
    }
    User.update({ email: existingUser }, { last_logged_in: Date.now() });
    const token = jwt.sign(
      { email: existingUser.email, id: existingUser._id },
      SECRET_KEY
    );
    res.cookie("token", token, {
      expires: new Date(Date.now() + oneDay),
      httpOnly: true,
    });
    if (api === true) {
      res.status(201).json({
        user: {
          id: existingUser._id,
          email: existingUser.email,
          nickname: existingUser.nickname,
        },
        token: token,
      });
    } else {
      res.redirect("/profile");
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.status(500).json({
        error: err,
        message: "Something went wrong",
      });
    } else {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    }
  }
};

//Send email for password reset
const resetEmail = async (req, res) => {
  const email = req.body.email || req.userEmail;
  console.log(req.userId, req.userEmail, email);
  try {
    let user = await User.findOne({ email: email });
    if (!user) {
      console.log("User not found");
      if (api === true) {
        return res.status(400).json({
          message: "User not found",
        });
      } else {
        res.render("error", {
          message_1: "OOPS!",
          message_2: "User not found",
          brace: "(",
        });
      }
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
        to: email,
        subject: "Reset Password",
        text: " Do not share this link.",
        html:
          '<p>Click <a href="http://192.168.88.244:8000/password/reset/' +
          recovery_token +
          '">here</a> to reset your password</p>',
      };
      transporter.sendMail(mailOptions, function (error, info) {
        if (error) {
          console.log(error);

          if (api === true) {
            return res.status(500).json({
              error: "An error occured",
            });
          } else {
            res.render("error", {
              message_1: "OOPS!",
              message_2: "An error occured",
              brace: "(",
            });
          }
        } else {
          console.log("Email sent" + info.response);
          if (api === true) {
            return res.status(201).json({
              status: "success",
              message: "Email sent successfully",
            });
          } else {
            res.render("success", { message: "Email sent successfully" });
          }
        }
      });
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    } else {
      res.status(500).json({
        error: "Something went wrong",
      });
    }
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
      if (api === true) {
        res.status(201).json({
          message: "Password Changed",
        });
      } else {
        res.render("login", {
          message: "Password changed. You can login here!",
        });
      }
    } else {
      console.log("Password do not match");
      if (api === true) {
        res.status(400).json({
          error: "Password do not match",
        });
      } else {
        res.render("error", {
          message_1: "OOPS!",
          message_2: "Password do not match",
          brace: "(",
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.status(500).json({
        error: "Something went wrong",
      });
    } else {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    }
  }
};

//fetches nickname of logged in user only
const get_nickname = async (req, res) => {
  try {
    const user = await User.findOne({ _id: req.userId });
    if (user) {
      console.log("Nickname:", user.nickname);

      if (api === true) {
        res.status(201).json({
          message: `Your nickname is ${user.nickname}`,
        });
      } else {
        res.render("profile", {
          name: user.nickname,
          email: user.email,
          role: user.role,
        });
      }
    } else {
      console.log("Error finding user");
      if (api === true) {
        res.status(400).json({
          message: "Error finding user",
        });
      } else {
        res.render("error", {
          message_1: "SORRY",
          message_2: "Error finding user",
          brace: "(",
        });
      }
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.status(500).json({
        message: "Something went wrong",
      });
    } else {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    }
  }
};

//allows to change nickname -> authorized only to logged in user
const change_nickname = async (req, res) => {
  const new_nickname = req.body.new_nickname;
  console.log(
    await User.updateOne({ email: req.userEmail }, { nickname: new_nickname })
  );
  if (api === true) {
    res.status(201).json({
      message: `Nickname updated to ${new_nickname}`,
    });
  } else {
    res.redirect("/user/nickname");
  }
};

//delete user->done by only admin
const delete_user = async (req, res) => {
  try {
    const admin = await User.findOne({ _id: req.userId });
    const user = await User.findOne({ email: req.params.email });
    if (user) {
      if (admin.role === "admin") {
        if (admin.email === req.params.email) {
          await User.deleteOne({ email: req.params.email });
          if (api === true) {
            return res.status(201).json({ message: "User Deleted" });
          } else {
            res.redirect("/login?message=Account Deleted");
          }
        } else {
          console.log(
            await User.deleteOne({ email: req.params.email }),
            "\n user deleted"
          );
          if (api === true) {
            res.status(201).json({ message: "User Deleted" });
          } else {
            res.render("success", { message: "User Deleted" });
          }
        }
      } else {
        console.log("Unauthorized to delete");
        if (api === true) {
          res.status(400).json({ error: "Not Authorized to do that" });
        } else {
          res.render("error", {
            message_1: "SORRY!",
            message_2: "Not Authorized to do that",
            brace: "(",
          });
        }
      }
    }
  } catch (err) {
    console.log(err);
    if (api === true) {
      res.status(500).json({ error: "Something went wrong!!" });
    } else {
      res.render("error", {
        message_1: "OOPS!",
        message_2: "Something went wrong",
        brace: "(",
      });
    }
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
        await User.updateOne({ email: user_email }, { role: "admin" }),
        "\nUser is authorized as an Admin"
      );
      if (api === true) {
        res
          .status(201)
          .json({ message: "User is authorized for admin's role" });
      } else {
        res.render("success", {
          message: "User is authorized for admin's role",
        });
      }
    } else {
      console.log("User not found");
      if (api === true) {
        res.status(400).json({ error: "User not found" });
      } else {
        res.render("error", {
          message_1: "OOPS!",
          message_2: "User not found",
          brace: "(",
        });
      }
    }
  } else {
    console.log("Unauthorized");
    if (api === true) {
      res.status(400).json({ message: "Not Authorized to do that" });
    } else {
      res.render("error", {
        message_1: "SORRY!",
        message_2: "Not Authorized to do that",
        brace: "(",
      });
    }
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
