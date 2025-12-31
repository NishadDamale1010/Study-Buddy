const express = require("express");
const router = express.Router();
const Todo = require("../models/todo");

// SHOW ALL TODOS
router.get("/", async (req, res) => {
    const todos = await Todo.find({});
    res.render("todos/index", { todos });
});

// FORM TO CREATE TODO
router.get("/new", (req, res) => {
    res.render("todos/new");
});

// CREATE TODO
router.post("/", async (req, res) => {
    const { title } = req.body;
    await Todo.create({ title });
    res.redirect("/todos");
});

// TOGGLE COMPLETE
router.put("/:id", async (req, res) => {
    const todo = await Todo.findById(req.params.id);
    todo.completed = !todo.completed;
    await todo.save();
    res.redirect("/todos");
});

// DELETE TODO
router.delete("/:id", async (req, res) => {
    await Todo.findByIdAndDelete(req.params.id);
    res.redirect("/todos");
});

module.exports = router;
