const express = require("express");
const cookieParser = require('cookie-parser');
const bcrypt = require("bcryptjs");
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
  b2xVn2: {
    longURL: "http://www.lighthouselabs.ca",
    userID: "userRandomID",
  },
  sm5xK8: {
    longURL: "https://www.google.ca",
    userID: "aJ48lW",
  }
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
    counter++;
  }
  return result;
};

// input email output user object with id, email, password. Or undefined if !email
const getUserByEmail = function(emailToCheck) {
  for (const user in users) {
    if (users[user].email === emailToCheck) {
      return users[user];
    }
  }
};

// returns the URLs where the userID is equal to the id of the currently logged-in user
// I: userID 
// O: object filtered by userID
const urlsForUser = function(id) {
  let thisUsersURLs = {};
  for (const url in urlDatabase) {
    if (urlDatabase[url].userID === id) {
      thisUsersURLs[url] = urlDatabase[url];
    }
  }
  return thisUsersURLs;
};

/******************************************************************** 
POST
**********************************************************************/
// Handle /login
app.post("/login", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;

  //ERROR HANDLING:
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // create flag for whether the email is in the users object
  let emailFound = false;

  for (const user in users) {
    if (users[user].email === email) {
      emailFound = true; // Set the flag to true if email is found
      if (bcrypt.compareSync(password, users[user].password)) { // if the email and password match
        res.cookie("user_id", users[user].id);
        return res.redirect("/urls");
      } else { // if email is in obj but password does not match
        return res.status(403).send("Incorrect password");
      }
    }
  }
  if (!emailFound) {
    return res.status(403).send("Account with email does not exist");
  }
});

// Handle /logout
app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  return res.redirect("/login");
});

// Register
app.post("/register", (req, res) => {
  const email = req.body.email;
  const password = req.body.password;
  const hashedPassword = bcrypt.hashSync(password, 10);

  //ERROR HANDLING:
  // if email or password are empty
  if (!email || !password) {
    return res.status(400).send("Email and password are required");
  }

  // if email already exists
  if (getUserByEmail(email)) {
    return res.status(400).send("Account already exists, please log in");
  }

  // if error free, add to global users object
  // generate random user_id, save to cookie
  const user_id = generateRandomString();
  res.cookie("user_id", user_id);
  users[user_id] = {
    id: user_id,
    email: email,
    password: hashedPassword
  };
  return res.redirect("/urls");
});

// Using HTML form to add newly generated short url and user inputted long url into database
app.post("/urls", (req, res) => {
  // if user is not logged in, respond with an HTML message 
  const currentUser = req.cookies.user_id;
  if (!currentUser) {
    return res.send("<html><body>Please log in to create shortened URLs</body></html>\n");
  }

  console.log(req.body); // Log the POST request body to the console

  // only allow url to be added if logged in - add shortURL, longURL, user_id to urlDatabase
  if (currentUser) {
    const shortURL = generateRandomString();
    urlDatabase[shortURL] = {
      longURL: req.body.longURL,
      userID: currentUser
    };
    return res.redirect(`/urls/${shortURL}`);
  }
});

// Form on My URLs page to delete a url
app.post("/urls/:id/delete", (req, res) => {
  const shortURL = req.params.id;
  const currentUser = req.cookies.user_id;
  const currentUserURLs = urlsForUser(currentUser);

  // if id does not exist 
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.send("<html><body>Cannot delete a shortened URL that does not exist!</body></html>\n");
  }

  // if user is not logged in, send HTML error
  if (!currentUser) {
    return res.send("<html><body>Please log in to delete this URL</body></html>\n");
  }

  // if user is not the owner of this URL
  if (!Object.keys(currentUserURLs).includes(shortURL)){
    return res.send("<html><body>You do not have permission to delete this URL</body></html>");
  }

  delete urlDatabase[shortURL];
  return res.redirect("/urls");
});

// Form on show URL page to edit a long URL
app.post("/urls/:id", (req, res) => {
  const shortURL = req.params.id;
  const currentUser = req.cookies.user_id;
  const currentUserURLs = urlsForUser(currentUser);

  // if id does not exist 
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.send("<html><body>Cannot edit a shortened URL that does not exist!</body></html>\n");
  }

  // if user is not logged in, send HTML error
  if (!currentUser) {
    return res.send("<html><body>Please log in to edit this URL</body></html>\n");
  }

  // if user is not the owner of this URL
  if (!Object.keys(currentUserURLs).includes(shortURL)){
    return res.send("<html><body>You do not have permission to edit this URL</body></html>");
  }  
  
  urlDatabase[shortURL].longURL = req.body.longURLedit;
  return res.redirect("/urls");
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
  if (!currentUser){
    return res.send("<html><body>Please log in to view your URLs</body></html>\n");
  }

  const currentUserURLs = urlsForUser(currentUser);
  const templateVars = {
    urls: currentUserURLs,
    user: users[currentUser]
  };
  return res.render("urls_index", templateVars);
});

// New URL page
app.get("/urls/new", (req, res) => {
  const currentUser = req.cookies.user_id;

  // if user is not logged in, redirect to /login
  if (!currentUser) {
    return res.redirect("/login");
  }

  const templateVars = { user: users[currentUser] };
  return res.render("urls_new", templateVars);
});

// Show page
app.get("/urls/:id", (req, res) => {
  const currentUser = req.cookies.user_id;
  const currentUserURLs = urlsForUser(currentUser);
  const shortURL = req.params.id

  // if user is not logged in
  if (!currentUser) {
    return res.send("<html><body>Please log in to view this page</body></html>\n");
  }

  // if id does not exist
   if (!Object.keys(urlDatabase).includes(shortURL)){
    return res.send("<html><body>This URL does not exist</body></html>");
  }

  // if user is not the owner of this URL
  if (!Object.keys(currentUserURLs).includes(shortURL)){
    return res.send("<html><body>You do not have permission to view this URL</body></html>");
  }

  const templateVars = {
    id: req.params.id,
    longURL: urlDatabase[shortURL].longURL,
    user: users[currentUser]
  };
  return res.render("urls_show", templateVars);
});

// Register page
app.get("/register", (req, res) => {
  const currentUser = req.cookies.user_id;

  // if user is logged in, redirect to /urls
  if (currentUser) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[currentUser] };
  return res.render("register", templateVars);
});

// Login page
app.get("/login", (req, res) => {
  const currentUser = req.cookies.user_id;

  // if user is logged in, redirect to /urls
  if (currentUser) {
    return res.redirect("/urls");
  }
  const templateVars = { user: users[currentUser] };
  return res.render("login", templateVars);
});

// Redirect u/shortURL to the longURL
app.get("/u/:id", (req, res) => {
  const shortURL = req.params.id;
  if (!Object.keys(urlDatabase).includes(shortURL)) {
    return res.send("<html><body>This shortened URL does not exist!</body></html>\n");
  }
  const redirectToUrl = urlDatabase[shortURL].longURL;
  return res.redirect(redirectToUrl);
});

// where i am as of march 8:
// need to figure out why longurl is not showing in table