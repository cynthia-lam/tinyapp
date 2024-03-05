const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

// creating our database objects
const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  userRandomID: {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur",
  },
  user2RandomID: {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk",
  },
};

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

// middleware
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// create a random string to be shortURL
function generateRandomString() {
  let result = "";
  const letters = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz";
  const lengthOfRandomString = 6;
  let counter = 0;
  while (counter < lengthOfRandomString) {
    result += letters.charAt(Math.floor(Math.random() * letters.length));
    counter ++;
  }
  return result;
};

// Handle /login
app.post("/login", (req, res) => {
  const enteredUsername = req.body.username;
  res.cookie("username", enteredUsername); 
  res.redirect("/urls");
});

// Handle /logout
app.post("/logout", (req, res) => {
  res.clearCookie("username"); 
  res.redirect("/urls");
});

// Register
app.post("/register", (req, res) => {
  const user_id = generateRandomString();
  res.cookie("user_id", user_id); 
  const email = req.body.email;
  const password = req.body.password;
  // console.log("Users before: ", users);
  users[user_id] = {user_id: user_id, 
               email: email,
              password: password};
  // console.log("Users after: ", users);
  res.redirect("/urls");
});

// Using HTML form to add newly generated short url and user inputted long url into database
app.post("/urls", (req, res) => {
  console.log(req.body); // Log the POST request body to the console
  const shortURL = generateRandomString();
  urlDatabase[shortURL] = req.body.longURL;
  res.redirect(`/urls/${shortURL}`);
});

// Form on My URLs page to delete a url
app.post("/urls/:id/delete", (req, res) => {
  const id = req.params.id;
  delete urlDatabase[id];
  res.redirect("/urls");
});

// Form on show URL page to edit a long URL
app.post("/urls/:id", (req, res) => {
  const id = req.params.id;
  urlDatabase[id] = req.body.longURLedit;
  res.redirect("/urls");
});

// Home page just says hello
app.get("/", (req, res) => {
  res.send("Hello!");
});

// Page to see json obj for urlDatabase
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

// Showing how HTML can be sent 
app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

// Showing that different pages have different 'scopes'
app.get("/set", (req, res) => {
  const a = 1;
  res.send(`a = ${a}`);
 });
 
 app.get("/fetch", (req, res) => {
  res.send(`a = ${a}`);
 });


 /******************************************************************** 
 Apply ejs template files
**********************************************************************/
 // Main page
 app.get("/urls", (req, res) => {
  const templateVars = { urls: urlDatabase,
                          username: req.cookies["username"] };
  res.render("urls_index", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

// Show page
app.get("/urls/:id", (req, res) => {
  const templateVars = { id: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        username: req.cookies["username"] };
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const templateVars = { email: req.body.email,
                          password: req.body.password};
  res.render("register", templateVars);
});

// Redirect u/shortURL to the longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});