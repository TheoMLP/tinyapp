const express = require('express')
const bodyParser = require('body-parser')
const cookieParser = require('cookie-parser')
const app = express()
const port = 8080 

app.use(bodyParser.urlencoded({extended: true}))
app.use(cookieParser())

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
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
}

const generateRandomString = () => {
 return Math.random().toString(36).substring(7)
}

const addUserInfo = (email, password) => {
  const userId = generateRandomString()
  users[userId] = {
    id: userId,
    email,
    password,
  }
  return userId 
}

const authenticator = (email) => {
  for (let user of Object.values(users)) {
    if (user.email === email) {
      return true
    }
  }
  return false
}

app.get('/', (req, res) => {
  res.statusCode = 200 
  res.send('Hello!')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/urls', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], urls: urlDatabase,}
  res.render('urls_index', templateVars)
})

app.get('/urls/new', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]]}
  res.render('urls_new', templateVars)
})

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render('urls_show', templateVars)
})

app.get('/u/:shortURL', (req, res) => {
  const longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.post('/urls/:shortURL/delete', (req, res)  => {
  const shortURL = req.params.shortURL
  delete urlDatabase[shortURL]
  res.redirect('/urls')
})

app.post('/urls/:id', (req, res) => {
  const shortURL = req.params.id
  urlDatabase[shortURL] = req.body.longURL
  res.redirect('/urls')
})

app.post('/login', (req, res) => {
  const username = req.body.username
  res.cookie('username', username)
  res.redirect('/urls')
})

app.post('/logout', (req, res) => {
  res.clearCookie('username')
  res.redirect('/urls')
})

app.get('/register', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('urls_registration', templateVars)
})

app.post('/register', (req, res) => {
  const { email, password } = req.body
  if (!email || !password) {
    res.status(400).send("Error, please fill in the remaining forms")
  }
  if (authenticator(email)) {
    res.status(400).send("Error, this email has already been registered")
  } else {
    const userId = addUserInfo(email, password)
    res.cookie('user_id', userId)
    res.redirect('/urls')
  }
})

app.get('/login', (req, res) => {
  let templateVars = { user: users[req.cookies["user_id"]] }
  res.render('urls_login', templateVars)
})

app.get('/users', (req, res) => {
  res.json(users)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
