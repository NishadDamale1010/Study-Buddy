const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");

// ROUTES
const dashboardRoutes = require("./routes/dashboard");
const todoRoutes = require("./routes/todos");
const noteRoutes = require("./routes/notes");
const pomodoroRoutes = require("./routes/pomodoro");

// ======================
// DATABASE
// ======================
mongoose.connect("mongodb://localhost:27017/study-buddy")
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

app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// ROUTES
// ======================
app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

app.use("/dashboard", dashboardRoutes);
app.use("/todos", todoRoutes);
app.use("/notes", noteRoutes);
app.use("/pomodoro", pomodoroRoutes);


// ======================
// SERVER
// ======================
app.listen(3000, () => {
    console.log("Study Buddy running on port 3000");
});
