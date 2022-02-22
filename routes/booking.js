//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");
const session = require("express-session");

/******************** B O O K I N G *********************/

router.get("/booking", isLoggedIn, (req, res, next) => {
  res.render("user/booking-form", { user: req.session.user });
});

router.post("/booking", (req, res, next) => {
  const { date, time, contact, message } = req.body;
  let minutes = 01;
  let service = req.body.service;
  const startDate = new Date(`${date}T${time}`);
  let endDate;
  const author = req.session.user;
  const authorID = req.session.user._id;
  let todaysDate = new Date();

  if (service) {
    //makes sure service is an array so that we can use map on it
    if (typeof service === "string") service = [service];

    //to get the minutes of the service and define endDate of event
    minutes = service
      .map((element) => element.split("+"))
      .map((element) => element[1])
      .map(Number)
      .reduce((a, b) => a + b);

    endDate = new Date(startDate.getTime() + minutes * 60000);

  } else {
    res.status(400).render("user/booking-form", {
      errorMessage: "Please select a service.",
    });
  }

  if (startDate.getTime() < todaysDate.getTime()) {
    return res.status(400).render("user/booking-form", {
      errorMessage: "Please select a valid date.",
    });
  }

  Event.create({
    service,
    startDate,
    endDate,
    contact,
    message,
    authorID,
  })
    .then((eventFromDB) => {
      return User.findByIdAndUpdate(authorID, {
        $push: { events: eventFromDB._id },
      });
    })
    .then(() => {
      res.render("index", {
        bookingConfirmation: "Booking request successfully sent.",
        user: author,
      });
    })
    .catch((err) =>
      console.log("Something went wrong while creating event =>", err)
    );
});

module.exports = router;
