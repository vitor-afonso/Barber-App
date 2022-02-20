//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

function createUpdatedEvents(event) {
  let bookingInfo = {};
  bookingInfo.service = event.service;
  bookingInfo.reqStatus = event.reqStatus;
  bookingInfo.eventYear = event.startDate.getFullYear();
  bookingInfo.eventMonth = event.startDate.getMonth() + 1;
  bookingInfo.eventDay = event.startDate.getDate();
  bookingInfo.eventHour = event.startDate.getHours();
  //to add a 0 when the minutes is only one digit
  if (event.startDate.getMinutes() <= 9) {
    bookingInfo.eventMin = `${0}${event.startDate.getMinutes()}`;
  } else {
    bookingInfo.eventMin = event.startDate.getMinutes();
  }
  return bookingInfo;
}

/******************** P R O F I L E *********************/

router.get("/profile", isLoggedIn, (req, res, next) => {
  const myUser = req.session.user;
  const myUserID = req.session.user._id;
  let confirmedBookings = [];
  let pendingBookings = [];
  let previousBookings = [];
  let todaysDate = new Date();

  User.findById(myUserID)
    .populate("events")
    .then((userFromDB) => {
      userFromDB.events.forEach((event) => {
      
        if (event.startDate.getTime() < todaysDate.getTime()) {
          previousBookings.push(createUpdatedEvents(event));
        }
        if (
          event.reqStatus === "Pending" &&
          event.startDate.getTime() >= todaysDate.getTime()
        ) {
          pendingBookings.push(createUpdatedEvents(event));
        }
        if (
          event.reqStatus === "Confirmed" &&
          event.startDate.getTime() >= todaysDate.getTime()
        ) {
          confirmedBookings.push(createUpdatedEvents(event));
        }

      });

      //console.log("User from DB =>", userFromDB);
      res.render("user/profile", {
        user: userFromDB,
        pendingBookings,
        confirmedBookings,
        previousBookings,
      });
    })
    .catch((err) => {
      console.log("error with populate =>", err);
    });
});

module.exports = router;
