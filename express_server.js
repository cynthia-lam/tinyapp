const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080

app.set("view engine", "ejs");

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});

 /******************************************************************** 
  middleware
**********************************************************************/
app.use(express.urlencoded({ extended: true })); // allows you to read body
app.use(cookieParser());


 /******************************************************************** 
  database objects
**********************************************************************/
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

 /******************************************************************** 
  functions
**********************************************************************/
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

// input email output user object with id, email, password. Or undefined if !email
const getUserByEmail = function(emailToCheck){
  for (const user in users) {
    if (users[user].email === emailToCheck){
      return users[user];
    }
  }
};


 /******************************************************************** 
POST
**********************************************************************/
// Handle /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  for (const user in users) {
    if (users[user].email === email && users[user].password === password) { // if the email and password match
      console.log("email and pw match");
      res.cookie("user_id", users[user].id);
      console.log(req.cookies.user_id);
      res.redirect("/urls");
    } else if (users[user].email === email) { // if email is in obj but password is not
      console.log(`user.email: ${users[user].email}, email: ${email}`);
      return res.status(403).send("Incorrect password");
    } else {
      return res.status(403).send("Account with email does not exist");
    }
  }
});

// Handle /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id"); 
  res.redirect("/login");
});

// Register
app.post("/register", (req, res) => {
  // generate random user_id, save to cookie
  const user_id = generateRandomString();
  res.cookie("user_id", user_id); 

  const email = req.body.email;
  const password = req.body.password;

  //ERROR HANDLING:
  // if email or password are empty
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // if email already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("Account already exists");
  }
  
  // if error free, add to global users object
  users[user_id] = {user_id: user_id, 
               email: email,
              password: password};
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


 /******************************************************************** 
GET
**********************************************************************/
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
  const currentUser = req.cookies.user_id;
  // console.log("this is user_id: ", req.cookies["user_id"]);
  const templateVars = { urls: urlDatabase,
                        user: users[currentUser]};
  res.render("urls_index", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  const currentUser = req.cookies.user_id;
  const templateVars = { user: users[currentUser] };
  res.render("urls_new", templateVars);
});

// Show page
app.get("/urls/:id", (req, res) => {
  const currentUser = req.cookies.user_id;
  const templateVars = { id: req.params.id,
                        longURL: urlDatabase[req.params.id],
                        user: users[currentUser] };
  res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const currentUser = req.cookies.user_id;
  const templateVars = { user: users[currentUser] };
  res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const currentUser = req.cookies.user_id;
  const templateVars = { user: users[currentUser] };
  res.render("login", templateVars);
});

// Redirect u/shortURL to the longURL
app.get("/u/:id", (req, res) => {
  const longURL = urlDatabase[req.params.id]
  res.redirect(longURL);
});