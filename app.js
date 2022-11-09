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

app.listen(port, function () {
  console.log(`server is up at ${port}`);
});
