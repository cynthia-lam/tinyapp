// input email output user object with id, email, password. Or undefined if !email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return;
};

// create a random string to be shortURL
function generateRandomString() {
  let result = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const lengthOfRandomString = 6;
  let counter = 0;
  while (counter < lengthOfRandomString) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
    counter++;
  }
  return result;
};

module.exports = { getUserByEmail, generateRandomString };