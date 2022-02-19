//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

/******************** B O O K I N G *********************/

router.get("/booking", isLoggedIn, (req, res, next) => {
  res.render("booking/booking-form");
});

router.post("/booking", (req, res, next) => {
  const { date, time, contact, message } = req.body;
  let service = req.body.service;
  let minutes = 30;
  if (service) {
    if (typeof service === "string") service = [service];
    minutes = service
      .map((el) => el.split("+"))
      .map((element) => element[1])
      .map(Number)
      .reduce((a, b) => a + b);

    console.log("minutes :>> ", minutes);
    console.log("req.body :>> ", req.body);
  }

  const startDate = new Date(`${date}T${time}`);
  //   const endDate = new Date(startDate.getTime() + minutes * 60000);

  const authorID = req.session.user._id;
  console.log(req.body, authorID);

  //res.redirect("confirmation");
});

/******************** B O O K I N G *********************/

module.exports = router;
