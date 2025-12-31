if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

require("dotenv").config();
const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const expressLayouts = require("express-ejs-layouts");


const sessionConfig = {
    name: "studybuddy-session",
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
        maxAge: 1000 * 60 * 60 * 24 * 7,
        sameSite: "lax"
    }
};

app.use(session(sessionConfig));

app.use(flash());

app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());




// ROUTES
const authRoutes = require("./routes/auth");

const dashboardRoutes = require("./routes/dashboard");
const todoRoutes = require("./routes/todos");
const noteRoutes = require("./routes/notes");
const pomodoroRoutes = require("./routes/pomodoro");

// ======================
// DATABASE
// ======================
const mongoURI = process.env.DB_URI || "mongodb://localhost:27017/study-buddy";
mongoose.connect(mongoURI)
.then(() => {
    console.log("MongoDB Connected");
})
.catch(err => {
    console.log("Mongo Error:", err);
});

// ======================
// APP CONFIG
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// ROUTES
// ======================
app.use(expressLayouts);
app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/todos", todoRoutes);
app.use("/notes", noteRoutes);
app.use("/pomodoro", pomodoroRoutes);


// ======================
// SERVER
// ======================
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Study Buddy running on port ${PORT}`);
});
