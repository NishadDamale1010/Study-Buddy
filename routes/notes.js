const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const { isLoggedIn } = require("../middleware");
const { marked } = require("marked");

/* =========================
   GET ALL NOTES
========================= */
router.get("/", isLoggedIn, async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id })
            .sort({ createdAt: -1 });

        res.render("notes/index", { notes, marked });
    } catch (err) {
        req.flash("error", "Unable to load notes");
        res.redirect("/dashboard");
    }
});

/* =========================
   CREATE NOTE
========================= */
router.post("/", isLoggedIn, async (req, res) => {
    try {
        const note = new Note({
            title: req.body.note.title,
            content: req.body.note.content,
            user: req.user._id
        });

        await note.save();
        req.flash("success", "Note added ✨");
        res.redirect("/notes");
    } catch (err) {
        req.flash("error", "Failed to add note");
        res.redirect("/notes");
    }
});

/* =========================
   EDIT NOTE FORM
========================= */
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }

        if (!note.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/notes");
        }

        res.render("notes/edit", { note });
    } catch (err) {
        req.flash("error", "Error loading note");
        res.redirect("/notes");
    }
});

/* =========================
   UPDATE NOTE
========================= */
router.put("/:id", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }

        if (!note.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
            return res.redirect("/notes");
        }

        await Note.findByIdAndUpdate(req.params.id, {
            title: req.body.note.title,
            content: req.body.note.content
        });

        req.flash("success", "Note updated ✏️");
        res.redirect("/notes");
    } catch (err) {
        req.flash("error", "Error updating note");
        res.redirect("/notes");
    }
});

/* =========================
   DELETE NOTE
========================= */
router.delete("/:id", isLoggedIn, async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);
        if (!note) {
            req.flash("error", "Note not found");
            return res.redirect("/notes");
        }

        if (!note.user.equals(req.user._id)) {
            req.flash("error", "Unauthorized access");
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
