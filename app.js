
if (process.env.NODE_ENV !== "production") {
    require("dotenv").config();
}

const express = require("express");
const app = express();
const path = require("path");
const mongoose = require("mongoose");
const methodOverride = require("method-override");
const session = require("express-session");
const flash = require("connect-flash");
const passport = require("passport");
const LocalStrategy = require("passport-local");
const User = require("./models/user");
const expressLayouts = require("express-ejs-layouts");
const MongoStore = require("connect-mongo");

app.set("trust proxy", 1);

// ======================
// ENVIRONMENT VALIDATION
// ======================
const requiredEnvVars = ["MONGO_URI", "SESSION_SECRET"];
const missingEnvVars = requiredEnvVars.filter(varName => !process.env[varName]);

if (missingEnvVars.length > 0) {
    console.error("❌ Missing required environment variables:", missingEnvVars.join(", "));
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
    console.warn("⚠️  Running in development mode with missing variables");
}

// ======================
// DATABASE CONNECTION
// ======================
const mongoURI = process.env.MONGO_URI;

if (!mongoURI) {
    console.error("❌ MONGO_URI is not defined");
    if (process.env.NODE_ENV === "production") {
        process.exit(1);
    }
}

// MongoDB connection options for production
const mongooseOptions = {
    serverSelectionTimeoutMS: 5000, // Timeout after 5s instead of 30s
    socketTimeoutMS: 45000, // Close sockets after 45s of inactivity
    family: 4, // Use IPv4, skip trying IPv6
    maxPoolSize: 10, // Maintain up to 10 socket connections
    minPoolSize: 5, // Maintain at least 5 socket connections
    retryWrites: true, // Retry write operations
    w: 'majority', // Write concern
};

// Connect to MongoDB
mongoose.connect(mongoURI, mongooseOptions)
    .then(() => {
        console.log("✅ MongoDB Connected Successfully");
    })
    .catch(err => {
        console.error("❌ MongoDB Connection Error:", err.message);
        if (process.env.NODE_ENV === "production") {
            console.error("Fatal: Cannot start server without database connection");
            process.exit(1);
        }
    });

// MongoDB connection event handlers
mongoose.connection.on("connected", () => {
    console.log("📊 Mongoose connected to MongoDB");
});

mongoose.connection.on("error", (err) => {
    console.error("❌ Mongoose connection error:", err);
});

mongoose.connection.on("disconnected", () => {
    console.warn("⚠️  Mongoose disconnected from MongoDB");
});

// ======================
// SESSION CONFIG
// ======================
const sessionConfig = {
    name: "studybuddy-session",
    secret: process.env.SESSION_SECRET || "devsecret",
    resave: false,
    saveUninitialized: false,
    store: mongoURI ? MongoStore.create({
        mongoUrl: mongoURI,
        touchAfter: 24 * 3600,
        ttl: 7 * 24 * 60 * 60 // 7 days
    }) : undefined, // Fallback to memory store if no MongoDB URI
    cookie: {
        httpOnly: true,
        secure: process.env.NODE_ENV === "production", 
        sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
        maxAge: 1000 * 60 * 60 * 24 * 7 // 7 days
    }
};

app.use(session(sessionConfig));
app.use(flash());

// ======================
// PASSPORT
// ======================
app.use(passport.initialize());
app.use(passport.session());

passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

// ======================
// GLOBAL LOCALS
// ======================
app.use((req, res, next) => {
    res.locals.success = req.flash("success");
    res.locals.error = req.flash("error");
    res.locals.currentUser = req.user;
    next();
});

// ======================
// APP CONFIG
// ======================
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.set("layout", "layouts/layout");

app.use(expressLayouts);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.use(express.static(path.join(__dirname, "public")));

// ======================
// ROUTES
// ======================
const authRoutes = require("./routes/auth");
const dashboardRoutes = require("./routes/dashboard");
const todoRoutes = require("./routes/todos");
const noteRoutes = require("./routes/notes");
const pomodoroRoutes = require("./routes/pomodoro");

app.get("/", (req, res) => {
    res.redirect("/dashboard");
});

app.use("/", authRoutes);
app.use("/dashboard", dashboardRoutes);
app.use("/todos", todoRoutes);
app.use("/notes", noteRoutes);
app.use("/pomodoro", pomodoroRoutes);

// ======================
// ERROR HANDLING
// ======================
// 404 Handler
app.use((req, res, next) => {
    res.status(404).render("error", { 
        title: "404 - Page Not Found",
        message: "Page Not Found",
        error: process.env.NODE_ENV === "development" ? {} : {}
    });
});

// Global Error Handler
app.use((err, req, res, next) => {
    console.error("Error:", err);
    
    // Don't leak error details in production
    const errorDetails = process.env.NODE_ENV === "development" ? err : {};
    
    res.status(err.status || 500).render("error", {
        title: "Error",
        message: err.message || "Something went wrong!",
        error: errorDetails
    });
});

// ======================
// SERVER
// ======================
const PORT = process.env.PORT || 3000;

// Start server only after MongoDB connection in production
const startServer = () => {
    const server = app.listen(PORT, () => {
        console.log(`🚀 Study Buddy running on port ${PORT}`);
        console.log(`📝 Environment: ${process.env.NODE_ENV || "development"}`);
    });

    // Graceful shutdown
    const gracefulShutdown = async (signal) => {
        console.log(`\n${signal} received. Starting graceful shutdown...`);
        
        server.close(async () => {
            console.log("HTTP server closed");
            
            try {
                await mongoose.connection.close();
                console.log("MongoDB connection closed");
                process.exit(0);
            } catch (err) {
                console.error("Error during shutdown:", err);
                process.exit(1);
            }
        });

        // Force shutdown after 10 seconds
        setTimeout(() => {
            console.error("Forced shutdown after timeout");
            process.exit(1);
        }, 10000);
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
};

// In production, wait for MongoDB connection before starting server
if (process.env.NODE_ENV === "production" && mongoURI) {
    mongoose.connection.once("connected", () => {
        startServer();
    });
} else {
    // In development, start immediately
    startServer();
}
