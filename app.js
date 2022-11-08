//requirements
const express = require("express");
const bodyParser = require("body-parser");
require("./db/conn");
// const User = require("./model/schema");
const port = process.env.PORT || 3000;

const app = express();
const AuthController = require("./controller/AuthController");

app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.json());
// app.use("/api", AuthRoute);

app.get("/", async function (req, res) {
  return res.status(200).json({ message: "Logged in" });
});

app.post("/signup", AuthController.register);
// app.post("/signup", AuthController.register);

app.post("/login", AuthController.login);

app.listen(port, function () {
  console.log(`server is up at ${port}`);
});

// return res.status(422.json{ error:""})
// status = 201 success
