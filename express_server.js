const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs"); 
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
let cookieParser = require('cookie-parser');
app.use(cookieParser());
let bcrypt = require('bcryptjs');

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += char.charAt((Math.random()*char.length));
  }
  return result;
};

const checkUserEmail = function (userEmail, database) {
  for (const id in database) {
    console.log(id)
    if (database[id].email === userEmail) {
      console.log(database[id])
      return database[id].id;
    }
  }
};

const checkPassword = function(database, password) {
  for (const id in database) {
    if ((bcrypt.compareSync(password, database[id].password ))) {
      return true;
    }
  }
  return false;
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: bcrypt.hashSync("123", 10)
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: bcrypt.hashSync("123", 10)
  }
};

const urlsForUser = function (id) {
  let specificURLs = {};

  for (let shortUrl in urlDatabase) {
    if (urlDatabase[shortUrl]['userID'] === id) {
      specificURLs[shortUrl] = urlDatabase[shortUrl];
    }
  }
  console.log("Specific URLs:", specificURLs);
  return specificURLs;
}

const urlDatabase = {
  b6UTxQ: {
      longURL: "https://www.lighthouselabs.ca",
      userID: "aJ48lW"
  },
  i3BoGr: {
      longURL: "https://www.google.ca",
      userID: "aJ48lW"
  }
};

app.get("/urls", (req, res) => {
  const id = req.cookies['user_ID'];
  const user = users[id];
  if (!user) {
    res.redirect('/login');
  }
  const templateVars = { urls: urlDatabase, username: users[req.cookies['user_ID']].email };
  res.render("urls_index", templateVars);
});



app.get("/urls/new", (req, res) => {
  const userID = req.cookies['user_ID'];
  const user = users[userID];
  const templateVars = { username: null};
  if (req.cookies['user_ID']) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});

// edit shortURLS
app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: long, username: users[req.cookies['user_ID']].email} ;
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
  console.log(longURL);
  res.redirect("/urls");
})

// deletes a url
app.post('/urls/:shortURL/delete', (req,res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect('/urls');
});

app.get("/urls/login", (req, res) => {
  res.render("urls_index");
});

app.post("/urls/login", (req, res) => {
  const user = req.body.username;
  res.cookie('user_ID', user);
  res.redirect('/urls');
})

app.post("/urls/logout", (req, res) => {
  res.clearCookie('user_ID');
  console.log("logging out");
  res.redirect('/urls');
})

app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  if (checkUserEmail(req.body.email, users) && (checkPassword(users, req.body.password))) {
    res.cookie('user_ID', checkUserEmail(email, users))
    // console.log(req.body);
  } else {
    res.status(404).send('Error 404: Wrong Username/Password')
  }
  //console.log(users);
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let code = generateRandomString(6)
  res.redirect(`http://localhost:8080/urls/${code}`);
  urlDatabase[code] = {longURL: req.body.longURL, userID: req.cookies['user_ID'], users};
  console.log(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL].longURL
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: null };
  res.render("urls_register", templateVars);
});
  
app.post("/register", (req, res) => {
  let usernameID = generateRandomString(6);
  //console.log(req.body);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Error 400 Bad Request: Enter username and password')
  };
  if (checkUserEmail(req.body.email, users)) {
    res.status(400).send('Error 400 Bad Request: Account already exists')
  };
  
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  console.log(users);
  res.cookie('user_ID', usernameID)

  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.redirect("/login");
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