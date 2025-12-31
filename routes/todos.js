const express = require("express");
const router = express.Router();
const Todo = require("../models/todo");
const { isLoggedIn } = require("../middleware");

router.get("/", isLoggedIn, async (req, res) => {
    try {
        const todos = await Todo.find({ user: req.user._id });
        res.render("todos/index", { todos });
    } catch (err) {
        req.flash("error", "Error loading tasks");
        res.redirect("/dashboard");
    }
});

router.post("/", isLoggedIn, async (req, res) => {
    try {
        const todo = new Todo(req.body.todo);
        todo.user = req.user._id;
        await todo.save();
        req.flash("success", "Task added ✅");
        res.redirect("/todos");
    } catch (err) {
        req.flash("error", "Error adding task");
        res.redirect("/todos");
    }
});

router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            req.flash("error", "Task not found");
            return res.redirect("/todos");
        }
        if (!todo.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect("/todos");
        }
        await Todo.findByIdAndUpdate(req.params.id, req.body.todo);
        req.flash("success", "Task updated ✅");
        res.redirect("/todos");
    } catch (err) {
        req.flash("error", "Error updating task");
        res.redirect("/todos");
    }
});

router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const todo = await Todo.findById(req.params.id);
        if (!todo) {
            req.flash("error", "Task not found");
            return res.redirect("/todos");
        }
        if (!todo.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect("/todos");
        }
        await Todo.findByIdAndDelete(req.params.id);
        req.flash("success", "Task deleted 🗑️");
        res.redirect("/todos");
    } catch (err) {
        req.flash("error", "Error deleting task");
        res.redirect("/todos");
    }
});

module.exports = router;
