const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const { isLoggedIn } = require("../middleware");
const { marked } = require("marked")

router.get("/", isLoggedIn, async (req, res) => {
    const notes = await Note.find({ author: req.user._id });
    res.render("notes/index", { notes, marked });
});

router.post("/", isLoggedIn, async (req, res) => {
    const note = new Note({
        title: req.body.title,
        content: req.body.content,
        author: req.user._id
    });
    await note.save();
    req.flash("success", "Note added ✨");
    res.redirect("/notes");
});

router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }
        if (!note.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect("/notes");
        }
        res.render("notes/edit", { note });
    } catch (err) {
        req.flash("error", "Error loading note");
        res.redirect("/notes");
    }
});

router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }
        if (!note.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect("/notes");
        }
        await Note.findByIdAndUpdate(req.params.id, req.body.note);
        req.flash("success", "Note updated ✏️");
        res.redirect("/notes");
    } catch (err) {
        req.flash("error", "Error updating note");
        res.redirect("/notes");
    }
});

router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }
        if (!note.user.equals(req.user._id)) {
            req.flash("error", "You don't have permission to do that");
            return res.redirect("/notes");
        }
        await Note.findByIdAndDelete(req.params.id);
        req.flash("success", "Note deleted 🗑️");
        res.redirect("/notes");
    } catch (err) {
        req.flash("error", "Error deleting note");
        res.redirect("/notes");
    }
});

module.exports = router;
