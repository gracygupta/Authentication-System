const jwt = require("jsonwebtoken");
const SECRET_KEY = "AUTHORIZED";

const auth = (req, res, next) => {
  try {
    let token = req.params.token || req.cookies.token;
    if (token) {
      let user = jwt.verify(token, SECRET_KEY);
      if (user) {
        req.userId = user.id;
        req.userEmail = user.email;
        console.log("User Authorized");
        next();
      }
    } else {
      console.log("Unauthorized User");
      return res.render("error", {
        message_1: "Unauthorized!",
        message_2: "Please try to login again",
        brace: "(",
      });
      // return res.status(401).json({
      //   message: "Unauthorized User",
      // });
    }
  } catch (err) {
    console.log(err);
    res.status(500).json({
      message: "Something went wrong",
    });
  }
};

module.exports = auth;
