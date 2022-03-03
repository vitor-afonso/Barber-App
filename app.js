//jshint esversion:8
// ℹ️ Gets access to environment variables/settings
// https://www.npmjs.com/package/dotenv
require("dotenv/config");

// ℹ️ Connects to the database
require("./db");

// Handles http requests (express is node js framework)
// https://www.npmjs.com/package/express
const express = require("express");

// Handles the handlebars
// https://www.npmjs.com/package/hbs
const hbs = require("hbs");

const app = express();


// ℹ️ This function is getting exported from the config folder. It runs most pieces of middleware
require("./config")(app);

const projectName = "project-2-barber-app";
const capitalized = (string) => string[0].toUpperCase() + string.slice(1).toLowerCase();

app.locals.appName = `Ironhack Barber App`;

app.locals.API_KEY = process.env.MAPS_KEY;

// 👇 Start handling routes here
const index = require("./routes");
app.use("/", index);

const authRoutes = require("./routes/auth");
app.use("/", authRoutes);

const booking = require("./routes/booking");
app.use("/", booking);

const profile = require("./routes/profile");
app.use("/", profile);

// ❗ To handle errors. Routes that don't exist or errors that you handle in specific routes
require("./error-handling")(app);

module.exports = app;
