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
    if (database[id].password === password) {
      return true;
    }
  }
  return false;
};

const users = { 
  "userRandomID": {
    id: "userRandomID", 
    email: "user@example.com", 
    password: "123"
  },
 "user2RandomID": {
    id: "user2RandomID", 
    email: "user2@example.com", 
    password: "123"
  }
};

const getUserByEmail = function(email) {
  const userValues = Object.values(users);
  for (const user of userValues) {
    if (user.email === email) {
      return user;
    }
  }
  return null;
}

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] };
  res.render("urls_index", templateVars);
});

app.get("/urls/new", (req, res) => {
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']  };
  res.render("urls_new", templateVars);
});

// edit shortURLS
app.get("/urls/:shortURL", (req, res) => {
  const long = urlDatabase[req.params.shortURL];
  const templateVars = { shortURL: req.params.shortURL, longURL: long, username: req.cookies['user_ID']} ;
  res.render("urls_show", templateVars);
});

app.post("/urls/:shortURL/edit", (req,res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL
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
  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID']};
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
  urlDatabase[code] = req.body.longURL;
  console.log(urlDatabase);
});

app.get("/u/:shortURL", (req, res) => {
  longURL = urlDatabase[req.params.shortURL]
  res.redirect(longURL);
});

app.get("/register", (req, res) => {
  const templateVars = { username: req.cookies['user_ID'] };
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
    password: req.body.password
  };
  console.log(users);
  res.cookie('user_ID', usernameID)

  const templateVars = { urls: urlDatabase, username: req.cookies['user_ID'] , userDatabase: users };
  res.redirect('/urls');
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