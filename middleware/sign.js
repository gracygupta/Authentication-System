const bcrypt = require("bcryptjs");

//signup
const checkPasswordUp = async (pass, cpass) => {
  if (cpass === pass) {
    return hash;
  } else {
    console.log("Passwords do not match.");
  }
};

const hash = bcrypt.genSalt(10, function (err, salt) {
  bcrypt.hash("superSecret", salt, function (err, hash) {
    // const password = hash;
    console.log("gracy");
    return hash;
    // res.json({success: true, message: 'Create user successful'});
  });
});

//login
const checkPasswordLogin = async (record, cpass) => {
  if (record.length > 0) {
    const pass = record[0].password;
    if (pass === securePassword(cpass)) {
      console.log("Logged In...");
      return true;
    } else {
      console.log("Wrong Password");
      return false;
    }
  } else {
    console.log("User not registered.");
  }
};

//Hashing
const securePassword = async (password) => {
  var passwordHashed = await bcrypt.hash(password, 10);
  console.log(passwordHashed);
  return password;
};

module.exports = { checkPasswordUp, checkPasswordLogin };
checkPasswordUp("gracy", "gracy");
checkPasswordLogin(
  [
    {
      email: "gracy@akg.com",
      password: "$2a$10$PT8KMrHCPM5pEs6c/1b4N.hVYjxUHTfsNCxoLQa95FFaN8hbleCH.",
    },
  ],
  "gracy"
);
