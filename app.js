//requirements
const express = require("express");

const bodyParser = require("body-parser");
const nodemailer = require("nodemailer");
const cookieParser = require("cookie-parser");
require("./db/conn");
const port = process.env.PORT || 3000;
const auth = require("./middleware/auth");

const app = express();
app.set("view engine", "ejs");
app.use((req, res, next) => {
  console.log("redirecting to ->");
  console.log("HTTP Method = " + req.method + " URL = " + req.url);
  next();
});

const AuthController = require("./controller/AuthController");
const User = require("./model/schema");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

//serves signup page
app.get("/signup", function (req, res) {
  res.render("signup");
});
//for getting register
app.post("/signup", AuthController.register);

app.get("/login", function (req, res) {
  message = req.query.message;
  if (message) {
    res.render("login", { message: message });
  } else {
    res.render("login", { message: "" });
  }
  // res.sendFile(__dirname + "/html/login.html");
});

//for login with authentification
app.post("/login", AuthController.login);

app.get("/profile", auth, async function (req, res) {
  const user = await User.findOne({ _id: req.userId });
  res.render("profile", {
    email: user.email,
    role: user.role,
    name: "",
  });
});

app.get("/password/reset", auth, AuthController.resetEmail);

//password reset email sender
app.post("/password/reset", auth, AuthController.resetEmail);

//serve reset password page
app.get("/password/reset/:token", function (req, res) {
  res.render("resetPassword", { token: req.params.token });
});

//password reset
app.post("/password/reset/:token", auth, AuthController.resetPassword);

//fetches the nickname to logged user only
app.get("/user/nickname", auth, AuthController.get_nickname);

//sets new nickname...accessible by logged in user only
app.post("/user/nickname", auth, AuthController.change_nickname);

app.get("/delete", auth, function (req, res) {
  res.redirect(`/admin/delete/${req.query.email}`);
});
//deletes the user...accessible only to user
app.get("/admin/delete/:email", auth, AuthController.delete_user);

app.get("/make_admin", function (req, res) {
  res.redirect(`/admin/make_admin/${req.query.email}`);
});

//makes any user admin...accessible only to admin
app.get("/admin/make_admin/:email", auth, AuthController.change_role);

app.listen(port, "0.0.0.0", function () {
  console.log(`server is up at ${port}`);
});
