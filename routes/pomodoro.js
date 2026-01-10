const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");
const Pomodoro = require("../models/pomodoro");

// Render Pomodoro page
router.get("/", isLoggedIn, (req, res) => {
  res.render("pomodoro");
});

// Save completed Pomodoro session
router.post("/complete", isLoggedIn, async (req, res) => {
  try {
    const { duration } = req.body; // minutes

    if (!duration) {
      return res.status(400).json({ error: "Duration required" });
    }

    await Pomodoro.create({
      user: req.user._id,
      duration
    });

    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Failed to save session" });
  }
});

module.exports = router;
