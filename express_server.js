const express = require('express')
const app = express()
const port = 8080 

app.set('view engine', 'ejs');

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

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

app.get('/urls/:shortURL', (req, res) => {
  let templateURL = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL]}
  res.render('urls_show', templateURL)
})

app.get('/hello', (req, res) => {
  res.send('<html><body>Hello <b>World</b></body></html>\n')
})

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
});
