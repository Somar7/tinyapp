const express = require("express");
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
const bcrypt = require('bcryptjs');
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: "session",
  keys: ["user_ID"],
}));

function generateRandomString(length) {
  let char = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += char.charAt((Math.random() * char.length));
  }
  return result;
}

const checkUserEmail = function(userEmail, database) {
  for (const id in database) {
    if (database[id].email === userEmail) {
      return database[id].id;
    }
  }
};

const getUserByEmail = function(userEmail, database) {
  for (const id in database) {
    if (database[id].email === userEmail) {
      return database[id].id;
    }
  }
};

const checkPassword = function(database, password) {
  for (const id in database) {
    if (bcrypt.compareSync(password, database[id].password)) {
      return true;
    }
  }
  return false;
};

const users = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: bcrypt.hashSync("12345", 10)
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: bcrypt.hashSync("123", 10)
  }
};

const urlDatabase = {
  b6UTxQ: {
    longURL: "https://www.lighthouselabs.ca",
    userID: "userRandomID"
  },
  i3BoGr: {
    longURL: "https://www.google.ca",
    userID: "userRandomID"
  }
};

app.get("/urls", (req, res) => {
  const id = req.session.user_ID;
  const user = users[id];
  if (!user) {
    res.status(401).send("You must <a href='/login'>login</a> first.");
  }
  const templateVars = { urls: urlDatabase, username: users[req.session.user_ID] };
  
  res.render("urls_index", templateVars);
});

// Creating new Short URLs
app.get("/urls/new", (req, res) => {
  const templateVars = { username: users[req.session.user_ID]};
  if (req.session.user_ID) {
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});


app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL].longURL;
  const templateVars = { shortURL: req.params.shortURL, longURL: long, username: users[req.session.user_ID]};
  let user_ID = req.session.user_ID;
  const user = req.session.user_ID;
  if (!urlDatabase[req.params.shortURL]) {
    res.send("Please try again! You don't have permission to view");
  }
  if (urlDatabase[req.params.shortURL].userID != user_ID) {
    res.send("Please try again! You don't have permission to view");
  }
  if (!user) {
    res.status(401).send("You must <a href='/login'>login</a> first.");
  }
  res.render("urls_show", templateVars);
});

// edit shortURLS
app.post("/urls/:shortURL/edit", (req,res) => {
  const userId = req.session.user_ID;
  if (userId) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect('/urls');
  } else {
    return res.status(403).send('Please login to edit this URL!');
  }
});

// deletes a url
app.post('/urls/:shortURL/delete', (req,res) => {
  const url = urlDatabase[req.params.shortURL];
  const usersURL = url && url.userID === req.session.user_ID;
  if (usersURL) {
    delete urlDatabase[req.params.shortURL];
    res.redirect('/urls');
  } else {
    return res.status(403).send('Please login to delete a URL!');
  }
});

// LOGIN - In header, no longer required
app.get("/urls/login", (req, res) => {
  res.render("urls_index");
});

app.post("/urls/login", (req, res) => {
  const user = req.body.username;
  res.cookie('user_ID', user);
  res.redirect('/urls');
});

app.post("/urls/logout", (req, res) => {
  req.session = null;
  res.redirect('/urls');
});

// LOGIN
app.get("/login", (req, res) => {
  const templateVars = { urls: urlDatabase, username: null};
  res.render("urls_login", templateVars);
});

app.post("/login", (req, res) => {
  let email = req.body.email;
  if (checkUserEmail(req.body.email, users) && (checkPassword(users, req.body.password))) {
    req.session.user_ID = getUserByEmail(email, users);
  } else {
    res.status(404).send('Error 404: Wrong Username/Password');
  }
  res.redirect('/urls');
});

app.post("/urls", (req, res) => {
  let code = generateRandomString(6);
  res.redirect(`http://localhost:8080/urls/${code}`);
  urlDatabase[code] = {longURL: req.body.longURL, userID: req.session.user_ID};
});

app.get("/u/:shortURL", (req, res) => {
  let longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});


// REGISTER
app.get("/register", (req, res) => {
  const templateVars = { username: null };
  res.render("urls_register", templateVars);
});
  
app.post("/register", (req, res) => {
  let usernameID = generateRandomString(6);
  if (req.body.email === "" || req.body.password === "") {
    res.status(400).send('Error 400 Bad Request: Enter username and password');
    return;
  }
  if (checkUserEmail(req.body.email, users)) {
    res.status(400).send('Error 400 Bad Request: Account already exists');
  }
  
  users[usernameID] = {
    id: usernameID,
    email: req.body.email,
    password: bcrypt.hashSync(req.body.password, 10)
  };
  req.session.user_ID = usernameID;

  res.redirect('/urls');
});

app.get("/", (req, res) => {
  res.redirect("/login");
});



app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});