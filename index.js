const express = require('express');
const bodyParser = require('body-parser');
const passport = require('passport');
const LocalStrategy = require('passport-local').Strategy;
const session = require('express-session');
const app = express();

// create temporary storage for login data
const storage = {
  1: {
    id: 1,
    username: 'bob',
    password: 'pass'
  },
  2: {
    id: 2,
    username: 'top',
    password: 'secret'
  }
};

// helper function to get user by username
function getUserByUsername(username){
  return Object.values(storage).find( function(user){
    return user.username === username;
  });
}

app.use('/static', express.static('static'));
app.use(bodyParser.json());

// configure user session
app.use(session({
  secret: 'any ole random string',
  resave: false,
  saveUninitialized: false
}));

// serialise user into session
passport.serializeUser(function(user, done) {
  done(null, user.id);
});

// deserialise user from session
passport.deserializeUser(function(id, done) {
  const user = storage[id];
  done(null, user);
});

// configure passport to use local strategy
// that is use locally stored credentials
passport.use(new LocalStrategy(
  function(username, password, done) {
    const user = getUserByUsername(username);
    if (!user) return done(null, false);
    if (user.password != password) return done(null, false);
    return done(null, user);
  }
));

// initialise passport and session
app.use(passport.initialize());
app.use(passport.session());

// helper function to check user is logged in
function isLoggedIn(req, res, next){
  if( req.user && req.user.id ){
    next();
  } else {
    res.status(401).end();
  }
}

// route to accept logins
app.post('/login', passport.authenticate('local', { session: true }), function(req, res) {
  res.redirect('/profile');
});

// route to display user info
app.get('/profile', isLoggedIn, function(req, res){
  // send user info. It should strip password at this stage
  res.json({user:req.user});
});

app.listen(8080, function() { // Set app to listen for requests on port 3000
  console.log('Listening on port 8080!'); // Output message to indicate server is listening
});
