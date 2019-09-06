const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const app = express();
const port = 8080;

//helper functions
const { 
  generateRandomString,
  addUserInfo, validate, 
  authenticator, urlsForUser, 
  displayError 
} = require('./lib/helper');

//dabases (url, users)
const { urlDatabase, users } = require('./dB/url&user');

//setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c']
}));

//All Routings

//home page routing
app.get('/', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    res.redirect('/login')
  }
});

//access main page containing users-specific URL
app.get('/urls', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    const matchingURLS = urlsForUser(templateVars.user.id, urlDatabase);
    templateVars.urls = matchingURLS;
    res.render('urls_index', templateVars);
  } else {
    res.render('urls_index', templateVars);
  }
});

//access 'Create URL' page
app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session.user_id] };
  if (templateVars.user) {
    res.render('urls_new', templateVars);
  } else {
    res.redirect('/login');
  }
});

//create new URL
app.post('/urls', (req, res) => {
  if (!req.session.user_id) {
    displayError("Cannot create URL before signing in", users[req.session.user_id], 403, res);
    return;
  }
  let shortURL = generateRandomString();
  urlDatabase[shortURL] = { 
    longURL: req.body.longURL, 
    userID: users[req.session.user_id].id 
  };
  res.redirect(`/urls/${shortURL}`);
});

//to access shortURL display page
app.get('/urls/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    displayError("ShortURL Not Found", users[req.session.user_id], 404, res);
    return;
  }
  let templateVars = { 
    user: users[req.session.user_id], 
    shortURL: req.params.shortURL, 
    longURL: urlDatabase[req.params.shortURL].longURL, 
    userID: urlDatabase[req.params.shortURL].userID 
  };
  res.render('urls_show', templateVars);
});

//to access original site
app.get('/u/:shortURL', (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    displayError("ShortURL doesn't exist", users[req.session.user_id], 404, res);
    return;
  }
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

//URL delete routing
app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL;
    delete urlDatabase[shortURL];
    res.redirect('/urls');
  } else {
    displayError("Unable to delete/no URL ownership", users[req.session.user_id], 403, res);
  }
});

//URL edit routing
app.post('/urls/:id', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const shortURL = req.params.id;
    urlDatabase[shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    displayError("Unable to edit/no URL ownership", users[req.session.user_id], 403, res);
  }
});

//get and validate login
app.get('/login', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_login', templateVars);
  }
});

app.post('/login', (req, res) => {
  const { email, password } = req.body;
  const errorMsg = validate(email, password, "login");
  if (errorMsg) {
    displayError(errorMsg, users[req.session.user_id], 400, res);
    return;
  }
  let authenticatedUser = authenticator(email, password);
  if (!authenticatedUser) {
    displayError("Incorrect Password", users[req.session.user_id], 401, res);
    return;
  }
  req.session.user_id = authenticatedUser.id;
  res.redirect('/urls');
});

//get logged out
app.post('/logout', (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

//get and create new profile
app.get('/register', (req, res) => {
  if (req.session.user_id) {
    res.redirect('/urls')
  } else {
    let templateVars = { user: users[req.session.user_id] };
    res.render('urls_registration', templateVars);
  }
});

app.post('/register', (req, res) => {
  const { email, password } = req.body;
  const errorMsg = validate(email, password, "register");
  if (errorMsg) {
    displayError(errorMsg, users[req.session.user_id], 400, res)
    return;
  }
  const userId = addUserInfo(email, password);
  req.session.user_id = userId;
  res.redirect('/urls');
});

//listening port
app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
