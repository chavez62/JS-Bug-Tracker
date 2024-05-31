const express = require('express');
const router = express.Router();
const passport = require('passport');
const User = require('../models/User');
const bcrypt = require('bcryptjs');

// Login route
router.get('/login', (req, res) => {
  res.render('login');
});

router.post('/login', passport.authenticate('local', {
  successRedirect: '/',
  failureRedirect: '/login',
  failureFlash: true // Enable flash messages on failure
}));

// Registration route
router.get('/register', (req, res) => {
  res.render('register');
});

router.post('/register', async (req, res) => {
  const { username, email, password } = req.body;
  const userExists = await User.findOne({ $or: [{ username }, { email }] });
  if (userExists) {
    req.flash('error_msg', 'Username or Email already exists');
    return res.redirect('/register');
  }

  const newUser = new User({ username, email, password });
  await newUser.save();
  req.flash('success_msg', 'You are registered and can log in');
  res.redirect('/login');
});

// Logout route
router.get('/logout', (req, res, next) => {
  req.logout(function(err) {
    if (err) { return next(err); }
    req.flash('success_msg', 'You are logged out');
    res.redirect('/login');
  });
});

// Profile route
router.get('/profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('profile', { user: req.user });
});

// Edit profile route
router.get('/edit-profile', (req, res) => {
  if (!req.isAuthenticated()) {
    return res.redirect('/login');
  }
  res.render('edit-profile', { user: req.user });
});

// Update profile route
router.post('/update-profile', async (req, res) => {
  const { username, email, currentPassword, newPassword } = req.body;
  const user = await User.findById(req.user.id);

  if (!user) {
    req.flash('error_msg', 'User not found');
    return res.redirect('/profile');
  }

  if (username) {
    user.username = username;
  }

  if (email) {
    user.email = email;
  }

  if (currentPassword && newPassword) {
    const isMatch = await bcrypt.compare(currentPassword, user.password);
    if (isMatch) {
      const salt = await bcrypt.genSalt(10);
      user.password = await bcrypt.hash(newPassword, salt);
    } else {
      req.flash('error_msg', 'Incorrect current password');
      return res.redirect('/edit-profile');
    }
  }

  await user.save();
  req.flash('success_msg', 'Profile updated successfully');
  res.redirect('/profile');
});

module.exports = router;
