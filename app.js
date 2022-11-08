//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const port = process.env.PORT || 3000;
const auth = require("./middleware/auth");

const app = express();
app.use((req, res, next) => {
  console.log("HTTP Method = " + req.method + " URL = " + req.url);
  next();
});

const AuthController = require("./controller/AuthController");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async function (req, res) {
  return res.status(200).json({ message: "Logged in" });
});

//for getting register
app.post("/signup", AuthController.register);

//for login with authentification
app.post("/login", AuthController.login);

//password reset email sender
app.post("/password/reset", auth, AuthController.resetEmail);

//password reset
app.post("/password/reser/:token", auth, AuthController.resetPassword);

//fetches the nickname to logged user only
app.get("user/nickname", auth, AuthController.get_nickname);

//sets new nickname...accessible by logged in user only
app.post("user/nickname", auth, AuthController.change_nickname);

//deletes the user...accessible only to user
app.get("admin/delete/:email");

//makes any user admin...accessible only to admin
app.get("admin/make_admin/:email");

app.listen(port, function () {
  console.log(`server is up at ${port}`);
});
