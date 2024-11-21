require('dotenv').config({ path: './backend/.env' });
const express = require('express');
const mongoose = require('mongoose');
const passport = require('passport');
const GitHubStrategy = require('passport-github2').Strategy;
const session = require('express-session');

const app = express();

// MongoDB connection
mongoose.connect(process.env.MONGO_URI, { useNewUrlParser: true, useUnifiedTopology: true })
  .then(() => console.log('Connected to MongoDB'))
  .catch((err) => console.error('MongoDB connection error:', err));

// User Schema
const UserSchema = new mongoose.Schema({
  githubId: String,
  username: String,
  profileUrl: String,
});
const User = mongoose.model('User', UserSchema);

// Passport configuration
passport.use(new GitHubStrategy({
  clientID: process.env.GITHUB_CLIENT_ID,
  clientSecret: process.env.GITHUB_CLIENT_SECRET,
  callbackURL: 'http://localhost:3000/auth/github/callback',
}, async (accessToken, refreshToken, profile, done) => {
  try {
    let user = await User.findOne({ githubId: profile.id });
    if (!user) {
      user = await User.create({
        githubId: profile.id,
        username: profile.username,
        profileUrl: profile.profileUrl,
      });
    }
    done(null, user);
  } catch (err) {
    done(err);
  }
}));

passport.serializeUser((user, done) => done(null, user.id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Middleware
app.use(session({ secret: 'secret', resave: false, saveUninitialized: true }));
app.use(passport.initialize());
app.use(passport.session());

// Routes
app.get('/auth/github', passport.authenticate('github', { scope: ['user:email'] }));

app.get('/auth/github/callback', passport.authenticate('github', {
  failureRedirect: '/login',
}), (req, res) => {
  res.redirect('http://localhost:4200'); // Redirect to Angular app after login
});

// Example protected route
app.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.status(401).send('Unauthorized');
  }
  res.send(req.user);
});

// Start server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Backend server running on http://localhost:${PORT}`));
