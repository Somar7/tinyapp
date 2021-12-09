const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs"); 

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

let cookieParser = require('cookie-parser');
app.use(cookieParser());

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += char.charAt((Math.random()*char.length));
  }
  return result;
};

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['username'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']  };
  res.render("urls_new", templateVars);
});

app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: long} ;
  res.render("urls_show", templateVars);
});

// deletes a url
app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls/login", (req, res) => {
  res.render("urls_index");
});

app.post("/urls/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});
  
app.post("/urls/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let code = generateRandomString(6)
  res.redirect(`http://localhost:8080/urls/${code}`);
  urlDatabase[code] = req.body.longURL;
  console.log(urlDatabase);
});
  
app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL]
  console.log(longURL);
  res.redirect(longURL);
});

app.get("/", (req, res) => {
  res.send("Hello!");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

app.get("/urls.json", (req, res) => {
    res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
    res.send("<html><body>Hello <b>World</b></body></html>\n");
});