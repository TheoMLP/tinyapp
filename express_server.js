const express = require('express');
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');
const app = express();
const port = 8080;

//helper functions
const { generateRandomString, addUserInfo, validate, authenticator, urlsForUser } = require('./lib/helper')

//dabases
const { urlDatabase, users } = require('./dB/url&user')

//setup
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieSession({
  name: "session",
  keys: ['e1d50c4f-538a-4682-89f4-c002f10a59c8', '2d310699-67d3-4b26-a3a4-1dbf2b67be5c']
}));

//routings
app.get('/', (req, res) => {
  res.statusCode = 200;
  res.send('Hello!');
});

app.get('/urls', (req, res) => {
  let templateVars = { user: users[req.session.user_id], urls: urlDatabase, }
  if (templateVars.user) {
    const matchingURLS = urlsForUser(templateVars.user.id, urlDatabase)
    templateVars.urls = matchingURLS
    res.render('urls_index', templateVars)
  } else {
    res.render('urls_index', templateVars)
  }
})

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.session.user_id] }
  if (templateVars.user) {
    res.render('urls_new', templateVars)
  } else {
    res.redirect('/login')
  }
})

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.session.user_id].id }
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user: users[req.session.user_id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: urlDatabase[req.params.shortURL].userID }
  res.render('urls_show', templateVars)
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
    const error = { errorMsg: "Unable to delete URL as this account is not the creator", user: users[req.session.user_id] }
    res.render('urls_error', error)
  }
})

app.post('/urls/:id', (req, res) => {
  if (req.session.user_id === urlDatabase[req.params.id].userID) {
    const shortURL = req.params.id
    urlDatabase[shortURL].longURL = req.body.longURL
    res.redirect('/urls')
  } else {
    const error = { errorMsg: "Unable to edit URL as this account is not the creator", user: users[req.session.user_id] }
    res.render('urls_error', error)
  }
})

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.session.user_id] }
  res.render('urls_login', templateVars)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const errorMsg = validate(email, password, "login")
  if (errorMsg) {
    const error = { errorMsg, statusCode: 403, user: users[req.session.user_id] }
    res.render('urls_error', error)
    return;
  }
  let authenticatedUser = authenticator(email, password)
  if (!authenticatedUser) {
    const error = { errorMsg: "Incorrect password", statusCode: 403, user: users[req.session.user_id] }
    res.render('urls_error', error)
    return;
  }
  req.session.user_id = authenticatedUser.id
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  req.session = null
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.session.user_id] }
  res.render('urls_registration', templateVars)
})

app.post('/register', (req, res) => {
  const { email, password } = req.body
  const errorMsg = validate(email, password, "register")
  if (errorMsg) {
    const error = { errorMsg, statusCode: 403, user: users[req.session.user_id] }
    res.render('urls_error', error)
    return;
  } else {
    const userId = addUserInfo(email, password)
    req.session.user_id = userId
    res.redirect('/urls')
  }
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
