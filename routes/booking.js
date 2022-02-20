//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

/******************** B O O K I N G *********************/

router.get("/booking", isLoggedIn, (req, res, next) => {
  res.render("user/booking-form");
});

router.post("/booking", (req, res, next) => {
  const { date, time, contact, message } = req.body;
  let minutes = 01;
  let service = req.body.service;
  const startDate = new Date(`${date}T${time}`);
  let endDate;
  const authorID = req.session.user._id;

  if (service) {
    //makes sure service is an array so that we can use map on it
    if (typeof service === "string") service = [service];
    
    minutes = service
      //split the element(string) to an array of 2 strings
      .map((element) => element.split("+"))
      //retrieve the minutes from the each element of the created array
      .map((element) => element[1])
      //converts the string or strings received to number
      .map(Number)
      //sums all items and returns the sum
      .reduce((a, b) => a + b);

    endDate = new Date(startDate.getTime() + minutes * 60000);

    service = service.map(element => element.split('+')).map(element => element[0]);
    // console.log("minutes :>> ", minutes);
    // console.log("req.body :>> ", req.body);
    // console.log("endDate :>> ", endDate);
    
  } else {
    res.status(400).render("user/booking-form", {
      errorMessage: "Please select a service.",
    });
  }
  
  console.log(service);
  Event.create({
    service,
    startDate,
    endDate,
    contact,
    message,
    authorID
  })
    .then((eventFromDB) => {

       return User.findByIdAndUpdate(authorID, {$push: {events: eventFromDB._id}});
    })
    .then(()=> {
        res.render("index", {bookingConfirmation: 'Booking request successfully sent.', user: req.session.user});
    })
    .catch((err) =>
      console.log("Something went wrong while creating event =>", err)
    );
});

module.exports = router;
