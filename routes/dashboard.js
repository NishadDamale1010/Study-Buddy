const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Todo = require("../models/todo");
const Note = require("../models/note");

router.get("/", isLoggedIn, async (req, res) => {
    try {
        const totalTodos = await Todo.countDocuments({ user: req.user._id });
        const pendingTodos = await Todo.countDocuments({ user: req.user._id, completed: false });
        const totalNotes = await Note.countDocuments({ user: req.user._id });

        res.render("dashboard", {
            title: "Dashboard | Study Buddy",
            totalTodos,
            pendingTodos,
            totalNotes
        });
    } catch (err) {
        req.flash("error", "Error loading dashboard");
        res.redirect("/login");
    }
});

module.exports = router;
