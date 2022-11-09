const jwt = require("jsonwebtoken");
const SECRET_KEY = "AUTHORIZED";

const auth = (req, res, next) => {
  try {
    let token = req.headers.authorization;
    console.log("headers", req.headers);
    console.log("token", token);
    if (token) {
      token = token.split(" ")[1];
      let user = jwt.verify(token, SECRET_KEY);
      req.userId = user.id;
      console.log("userID", req.userId);
      console.log("Authorized");
    } else {
      res.status(401).json({
        message: "Unauthorized User",
      });
    }
    next();
  } catch (err) {
    console, log(err);
    res.status(401).json({
      message: "Unauthorized User",
    });
  }
};

module.exports = auth;
