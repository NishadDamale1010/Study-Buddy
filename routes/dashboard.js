const express = require("express");
const router = express.Router();
const Todo = require("../models/todo");
const Note = require("../models/note");

router.get("/", async (req, res) => {
    const totalTodos = await Todo.countDocuments({});
    const pendingTodos = await Todo.countDocuments({ completed: false });
    const totalNotes = await Note.countDocuments({});

    res.render("dashboard", {
        totalTodos,
        pendingTodos,
        totalNotes
    });
});

module.exports = router;
