//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

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
          previousBookings.push(event);
        }
        if (event.reqStatus === 'Pending' && event.startDate.getTime() >= todaysDate.getTime()) {
          pendingBookings.push(event);
        }
        if (event.reqStatus === 'Confirmed' && event.startDate.getTime() >= todaysDate.getTime()) {
          confirmedBookings.push(event);
        }
        
      });

      //console.log('pending bookings =>', pendingBookings);
      //console.log("User fom DB with populate", userFromDB);
      res.render("user/profile", { user: userFromDB, pendingBookings, confirmedBookings, previousBookings });
    })
    .catch((err) => {
      console.log("error with populate =>", err);
    });
});

module.exports = router;
