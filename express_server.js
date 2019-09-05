const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const bcrypt = require('bcrypt');
const app = express();
const port = 8080;

app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": { longURL:"http://www.lighthouselabs.ca", userID: "aJ48lW"},
  "9sm5xK": { longURL:"http://www.google.com", userID: "aJ48lW"}
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const generateRandomString = () => {
  return Math.random().toString(36).substring(7);
};

const addUserInfo = (email, password) => {
  const hashedPassword = bcrypt.hashSync(password, 10)
  const userId = generateRandomString();
  users[userId] = {
    id: userId,
    email,
    password: hashedPassword,
  };
  return userId;
};

const findUser = (email) => {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return user;
    }
  }
  return false;
};

const validate = (email, password, action) => {
  const user = findUser(email);
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

const authenticator = (email, password) => {
  const user = findUser(email);
  if (user && bcrypt.compareSync(password, user.password)) {
    return user;
  }
  return false;
};

const urlsForUser = (id) => {
  let matchingURLS = [];
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      matchingURLS.push({shortURL: url, ...urlDatabase[url]});
    }
  }
  return matchingURLS;
};

app.get('/', (req, res) => {
  res.statusCode = 200;
  res.send('Hello!');
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase);
})

app.get('/urls', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase,}
  if (templateVars.user) {
    const matchingURLS = urlsForUser(templateVars.user.id)
    templateVars.urls = matchingURLS
    res.render('urls_index', templateVars)
  } else {
    res.render('urls_index', templateVars)
  }
})

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]}
  if (templateVars.user) {
    res.render('urls_new', templateVars)
  } else {
    res.redirect('/login')
  }
})

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = { longURL: req.body.longURL, userID: users[req.cookies["user_id"]].id }
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL].longURL, userID: urlDatabase[req.params.shortURL].userID}
  res.render('urls_show', templateVars)
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res)  => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.shortURL
    delete urlDatabase[shortURL]
    res.redirect('/urls')
  } else {
    res.status(400).send("Unable to delete URL as this account is not the creator")
  }
})

app.post('/urls/:id', (req, res) => {
  if (req.cookies["user_id"] === urlDatabase[req.params.shortURL].userID) {
    const shortURL = req.params.id
    urlDatabase[shortURL] = req.body.longURL
    res.redirect('/urls')
  } else {
    res.status(400).send("Unable to delete URL as this account is not the creator")
  }
})

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('urls_login', templateVars)
})

app.post('/login', (req, res) => {
  const { email, password } = req.body
  const errorMsg = validate(email, password, "login")
  if (errorMsg) {
    res.status(403).send(errorMsg)
    return;
  } 
  let authenticatedUser = authenticator(email, password)
  if (!authenticatedUser) {
    res.status(403).send("Incorrect Password")
    return;
  }
  res.cookie("user_id", authenticatedUser.id)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('user_id')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('urls_registration', templateVars)
})

app.post('/register', (req, res) => {
  const { email, password } = req.body
  const errorMsg = validate(email, password, "register")
  if (errorMsg) {
    res.status(400).send(errorMsg)
  } else {
    const userId = addUserInfo(email, password)
    res.cookie('user_id', userId)
    res.redirect('/urls')
  }
})

app.get("/users", (req, res) => {
  res.json(users)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
