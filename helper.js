const bcrypt = require('bcrypt');

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const addUserInfo = (email, password, database) => {
  const hashedPassword = bcrypt.hashSync(password, 10)
  const userId = generateRandomString();
  database[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };
  return userId;
};

const findUserByEmail = (email, database) => {
  for (let user of Object.values(database)) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const validate = (email, password, action, database) => {
  const user = findUserByEmail(email, database);
  if (!email || !password) {
    return "Error, please fill in the remaining forms";
  }
  if (user && action === "register") {
    return "Error, this email has already been registered";
  }
  if (!user && action === "login") {
    return "User not found";
  }
  return false;
};

const authenticator = (email, password, database) => {
  const user = findUserByEmail(email, database);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

const urlsForUser = (id, urlDatabase) => {
  let matchingURLS = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matchingURLS.push({shortURL: url, ...urlDatabase[url]});
    }
  }
  return matchingURLS;
};

module.exports = { generateRandomString, addUserInfo, validate, authenticator, urlsForUser }