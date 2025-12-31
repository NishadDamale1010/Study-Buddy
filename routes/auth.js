const express = require("express");
const router = express.Router();
const passport = require("passport");
const User = require("../models/user");

/* ================================
   SHOW LOGIN + REGISTER PAGE
   (NO LAYOUT, NO NAVBAR)
================================ */
router.get("/login", (req, res) => {
    res.render("auth/auth", {
        layout: false   // 🔥 VERY IMPORTANT
    });
});

/* ================================
   REGISTER USER
================================ */
router.post("/register", async (req, res, next) => {
    try {
        const { username, email, password } = req.body;

        const user = new User({ username, email });
        const registeredUser = await User.register(user, password);

        req.login(registeredUser, err => {
            if (err) return next(err);
            req.flash("success", "Welcome to Study Buddy 🎉");
            res.redirect("/dashboard");
        });

    } catch (e) {
        req.flash("error", e.message);
        res.redirect("/login");
    }
});

/* ================================
   LOGIN USER
================================ */
router.post(
    "/login",
    passport.authenticate("local", {
        failureFlash: true,
        failureRedirect: "/login"
    }),
    (req, res) => {
        req.flash("success", "Welcome back 👋");
        res.redirect("/dashboard");
    }
);

/* ================================
   LOGOUT USER
================================ */
router.get("/logout", (req, res, next) => {
    req.logout(err => {
        if (err) return next(err);
        req.flash("success", "Logged out successfully");
        res.redirect("/login");
    });
});

module.exports = router;
