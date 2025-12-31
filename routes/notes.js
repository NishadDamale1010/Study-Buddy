const express = require("express");
const router = express.Router();
const Note = require("../models/note");
const { isLoggedIn } = require("../middleware");

// SHOW ALL NOTES
router.get("/", isLoggedIn, async (req, res) => {
    const notes = await Note.find({});
    res.render("notes/index", { notes });
});


// NEW NOTE FORM
router.get("/new", isLoggedIn, (req, res) => {
    res.render("notes/new");
});

// CREATE NOTE
router.post("/", isLoggedIn, async (req, res) => {
    const note = new Note(req.body.note);
    await note.save();
    res.redirect("/notes");
});


// EDIT FORM
router.get("/:id/edit", isLoggedIn, async (req, res) => {
    const note = await Note.findById(req.params.id);
    if (!note) {
        return res.redirect("/notes");
    }
    res.render("notes/edit", { note });
});

// UPDATE NOTE
router.put("/:id", isLoggedIn, async (req, res) => {
    await Note.findByIdAndUpdate(req.params.id, req.body.note);
        res.redirect("/notes");
});

// DELETE NOTE
router.delete("/:id", isLoggedIn, async (req, res) => {
    await Note.findByIdAndDelete(req.params.id);
    res.redirect("/notes");
});

module.exports = router;
