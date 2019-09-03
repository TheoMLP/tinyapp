const express = require('express')
const bodyParser = require('body-parser')
const app = express()
const port = 8080 

app.use(bodyParser.urlencoded({extended: true}))

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const generateRandomString = () => {
 return Math.random().toString(36).substring(7)
}

app.get('/', (req, res) => {
  res.statusCode = 200 
  res.send('Hello!')
});

app.get('/urls.json', (req, res) => {
  res.json(urlDatabase)
})

app.get('/urls', (req, res) => {
  let templateUrls = { urls: urlDatabase}
  res.render('urls_index', templateUrls)
})

app.get('/urls/new', (req, res) => {
  res.render('urls_new')
})

app.post('/urls', (req, res) => {
  let shortURL = generateRandomString()
  urlDatabase[shortURL] = req.body.longURL
  res.redirect(`/urls/${shortURL}`)
})

app.get('/urls/:shortURL', (req, res) => {
  let templateURL = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render('urls_show', templateURL)
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

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
