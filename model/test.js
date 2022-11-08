var bcrypt = require("bcryptjs");
bcrypt - decodeURIComponent.bcrypt;
/** One way, can't decrypt but can compare */
var salt = bcrypt.genSaltSync(10);

/** Encrypt password */
bcrypt.hash("gracy", salt, (err, res) => {
  console.log("hash", res);
  hash = res;
  compare(hash);
});

/** Compare stored password with new encrypted password */
function compare(encrypted) {
  bcrypt.compare("gracy", encrypted, (err, res) => {
    // res == true or res == false
    console.log("Compared result", res, hash);
  });
}
