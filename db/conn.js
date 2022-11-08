const mongoose = require("mongoose");
require("dotenv").config();

const conn_str =
  "mongodb+srv://" +
  process.env.DB_USER +
  ":" +
  process.env.DB_PASSWORD +
  "@" +
  process.env.DB_CLUSTER +
  ".fd3ppny.mongodb.net/" +
  process.env.DB_DATABASE +
  "?retryWrites=true&w=majority";

mongoose.connect(
  conn_str,
  {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  },
  (err) => {
    if (err) {
      console.log(err);
      console.log("error in connection");
    } else {
      console.log("mongodb is connected");
    }
  }
);
