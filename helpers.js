// input email output user object with id, email, password. Or undefined if !email
const getUserByEmail = function(email, database) {
  for (const user in database) {
    if (database[user].email === email) {
      return database[user];
    }
  }
  return;
};

module.exports = { getUserByEmail };