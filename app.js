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
app.use(cookieParser());
app.use((req, res, next) => {
  console.log("redirecting to ->");
  console.log("HTTP Method = " + req.method + " URL = " + req.url);
  next();
});

const AuthController = require("./controller/AuthController");

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async function (req, res) {
  console.log(req.cookies.token);
  return res.status(200).json({ message: "Logged in" });
});

//for getting register
app.post("/signup", AuthController.register);

//for login with authentification
app.post("/login", AuthController.login);

//password reset email sender
app.post("/password/reset", AuthController.resetEmail);

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

//deletes the user...accessible only to user
app.get("/admin/delete/:email", auth, AuthController.delete_user);

//makes any user admin...accessible only to admin
// app.get("admin/make_admin/:email");

app.listen(port, "0.0.0.0", function () {
  console.log(`server is up at ${port}`);
});
