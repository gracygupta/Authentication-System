//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
const User = require("./model/schema");
const port = process.env.PORT || 3000;
// const signup = require("./middleware/sign").checkPasswordUp;
// signup("gracy", "gracy");

const app = express();

app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());

app.get("/", async function (req, res) {
  return res.status(200).json({ message: "Logged in" });
});

app.post("/signup", async function (req, res) {
  const { email, username, role, password, cpassword } = req.body;
  if (cpassword === password) {
    const user = new User({
      email: email,
      nickname: username,
      password: password,
      role: role,
    });

    user.save();
  }
});

app.listen(port, function () {
  console.log(`server is up at ${port}`);
});

// return res.status(422.json{ error:""})
// status = 201 success
