const express = require("express");
const bodyParser = require("body-parser");
const path = require("path");
const mongoose = require("mongoose");
const passport = require("passport");
const LocalStrategy = require("passport-local").Strategy;
const session = require("express-session");
const bcrypt = require("bcryptjs");
const flash = require("connect-flash");
require("dotenv").config();

const app = express();

// Connect to MongoDB
mongoose
  .connect(process.env.MONGODB_URI, {
    useNewUrlParser: true,
    useUnifiedTopology: true,
  })
  .then(() => console.log("MongoDB connected"))
  .catch((err) => console.log(err));

// Middleware
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, "public"))); // Ensure this line is included to serve static files
app.use("/uploads", express.static(path.join(__dirname, "uploads"))); // Serve files from 'uploads' directory
app.set("view engine", "ejs");
app.use(
  session({
    secret: process.env.SECRET,
    resave: false,
    saveUninitialized: false,
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash()); // Use flash middleware

// Set global variables for flash messages
app.use((req, res, next) => {
  res.locals.success_msg = req.flash("success_msg");
  res.locals.error_msg = req.flash("error_msg");
  res.locals.error = req.flash("error");
  res.locals.user = req.user || null;
  next();
});

// Import User model
const User = require("./models/User");

// Passport configuration
passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ username });
      if (!user) return done(null, false, { message: "Incorrect username." });
      const isMatch = await bcrypt.compare(password, user.password);
      if (!isMatch)
        return done(null, false, { message: "Incorrect password." });
      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user, done) => {
  done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err);
  }
});

// Create default user if not exists
const createDefaultUser = async () => {
  const user = await User.findOne({ username: "admin" });
  if (!user) {
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash("password", salt);
    const newUser = new User({
      username: "admin",
      password: hashedPassword,
    });
    await newUser.save();
    console.log("Default user created");
  }
};
createDefaultUser();

// Routes
const bugRoutes = require("./routes/bug");
const authRoutes = require("./routes/auth");
app.use("/", authRoutes);
app.use("/", bugRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
