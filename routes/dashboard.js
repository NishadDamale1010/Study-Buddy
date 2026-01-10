const express = require("express");
const router = express.Router();
const { isLoggedIn } = require("../middleware");

const Todo = require("../models/todo");
const Note = require("../models/note");
const Pomodoro = require("../models/pomodoro");

router.get("/", isLoggedIn, async (req, res) => {
  try {
    const userId = req.user._id;

    //  Greeting
    const hour = new Date().getHours();
    let greeting = "Hello";
    if (hour < 12) greeting = "Good Morning";
    else if (hour < 18) greeting = "Good Afternoon";
    else greeting = "Good Evening";

    //  Today range
    const startOfDay = new Date();
    startOfDay.setHours(0, 0, 0, 0);

    const endOfDay = new Date();
    endOfDay.setHours(23, 59, 59, 999);

    //  Pomodoro focus time
    const pomodoros = await Pomodoro.find({
      user: userId,
      completedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    const focusTime = pomodoros.reduce(
      (sum, p) => sum + p.duration,
      0
    );

    //  Todos completed today
    const todosCompleted = await Todo.countDocuments({
      user: userId,
      completed: true,
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    //  Notes updated today
    const notesUpdated = await Note.countDocuments({
      user: userId,
      updatedAt: { $gte: startOfDay, $lte: endOfDay }
    });

    //  Recent activity
    const recentTodos = await Todo.find({ user: userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(3);

    const recentNotes = await Note.find({ user: userId })
      .sort({ updatedAt: -1, createdAt: -1 })
      .limit(2);

    const activities = [];

    // Todos
    recentTodos.forEach(t => {
      const date = t.updatedAt || t.createdAt;
      if (date) {
        activities.push({
          message: `Updated Todo: ${t.title}`,
          date
        });
      }
    });

    // Notes
    recentNotes.forEach(n => {
      const date = n.updatedAt || n.createdAt;
      if (date) {
        activities.push({
          message: `Edited Note: ${n.title}`,
          date
        });
      }
    });

   
    activities.sort((a, b) => b.date - a.date);

   
    const formattedActivities = activities.map(act => ({
      message: act.message,
      time: act.date.toLocaleTimeString()
    }));

    res.render("dashboard", {
      greeting,
      user: req.user,
      stats: {
        focusTime,
        todosCompleted,
        notesUpdated,
        sessions: pomodoros.length
      },
      activities: formattedActivities
    });

  } catch (err) {
    console.error(err);
    req.flash("error", "Something went wrong loading dashboard");
    res.redirect("/");
  }
});

module.exports = router;
