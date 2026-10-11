const User = require("../models/user.js");

module.exports.renderSignupForm = (req, res) => {
  res.render("users/signup.ejs");
};

module.exports.signup = async (req, res, next) => {
  try {
    const { username, email, password } = req.body;

    if (!password || password.length < 8) {
      req.flash("error", "Password must be at least 8 characters long.");
      return res.redirect("/signup");
    }

    const newUser = new User({ email, username });
    const registeredUser = await User.register(newUser, password); // Passport Logic (hashes the password)

    // after signup automatically login, passport logic
    req.login(registeredUser, (err) => {
      if (err) {
        return next(err);
      }
      req.flash("success", "User Registered Successfully!!");
      res.redirect("/listings");
    });
  } catch (err) {
    // Duplicate email comes from the unique index, not from passport
    const message =
      err.code === 11000
        ? "An account with that email already exists."
        : err.message;
    req.flash("error", message);
    res.redirect("/signup");
  }
};

module.exports.renderLoginForm = (req, res) => {
  res.render("users/login.ejs");
};

module.exports.login = (req, res) => {
  req.flash("success", "Welcome Back to Wanderlust");
  // redirect to the page the user wanted before being sent to login
  const redirectUrl = res.locals.redirectUrl || "/listings";
  res.redirect(redirectUrl);
};

module.exports.logout = (req, res, next) => {
  req.logout((err) => {
    if (err) {
      return next(err);
    }
    req.flash("success", "Logged Out!");
    res.redirect("/listings");
  });
};
