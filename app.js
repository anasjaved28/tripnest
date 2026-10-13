if (process.env.NODE_ENV !== "production") {
  require("dotenv").config();
}

const express = require("express");
const app = express();
const mongoose = require("mongoose");
const path = require("path");
const methodOverride = require("method-override");
const ejsMate = require("ejs-mate");
const ExpressError = require("./utils/ExpressError.js");
const session = require("express-session");
const { createWebCryptoAdapter, MongoStore } = require("connect-mongo");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");

// MODELS
const User = require("./models/user.js");

// ROUTES
const listingRouter = require("./routes/listing.js");
const reviewRouter = require("./routes/review.js");
const userRouter = require("./routes/user.js");

const isProduction = process.env.NODE_ENV === "production";

// Needed when deployed behind a proxy (Render, Heroku, etc.) so secure cookies work
if (isProduction) {
  app.set("trust proxy", 1);
}

// EJS setup
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.engine("ejs", ejsMate);

app.use(express.static(path.join(__dirname, "public")));
app.use(methodOverride("_method"));

// Middleware to parse incoming request bodies
app.use(express.urlencoded({ extended: true }));
app.use(express.json());

const store = MongoStore.create({
  mongoUrl: process.env.ATLAS_URI,
  cryptoAdapter: createWebCryptoAdapter({
    secret: process.env.SESSION_SECRET,
  }),
  touchAfter: 24 * 3600, // time period in seconds
});

store.on("error", (e) => {
  console.log("Error in mongo SESSION STORE", e);
});

const sessionOptions = {
  store,
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: false,
  cookie: {
    maxAge: 7 * 24 * 60 * 60 * 1000,
    httpOnly: true, // JS in the browser can't read the cookie
    sameSite: "lax", // basic CSRF protection
    secure: isProduction, // cookie only sent over HTTPS in production
  },
};

app.use(session(sessionOptions));
app.use(flash());

// PASSPORT logic
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  res.locals.currUser = req.user;
  next();
});

// ROUTES
app.get("/", (req, res) => {
  res.redirect("/listings");
});
app.use("/listings", listingRouter);
app.use("/listings/:id/reviews", reviewRouter);
app.use("/", userRouter);

// UNKNOWN PATH INTERCEPTOR
app.all("/{*splat}", (req, res, next) => {
  next(new ExpressError(404, "Page not found"));
});

// ERROR handling middleware
app.use((err, req, res, next) => {
  if (res.headersSent) {
    return next(err);
  }

  // Invalid ObjectId in the URL (e.g. /listings/abc)
  if (err.name === "CastError") {
    err = new ExpressError(404, "Page not found");
  }
  // Upload problems (file too large, etc.)
  if (err.name === "MulterError") {
    err = new ExpressError(400, err.message);
  }

  const statusCode = err.statusCode || 500;
  let message = err.message || "Something went wrong";

  if (statusCode === 500) {
    console.error(err);
    if (isProduction) {
      message = "Something went wrong"; // don't leak internal error details
    }
  }

  res.status(statusCode).render("error.ejs", { message });
});

async function startServer() {
  try {
    if (
      !process.env.PORT ||
      !process.env.ATLAS_URI ||
      !process.env.SESSION_SECRET
    ) {
      throw new Error("Missing required environment variables");
    }

    await mongoose.connect(process.env.ATLAS_URI);
    console.log("Connected to DB");

    app.listen(process.env.PORT, () => {
      console.log(`Server is listening on port ${process.env.PORT}`);
    });
  } catch (err) {
    console.error("Server startup failed:", err);
    process.exit(1);
  }
}

startServer();
