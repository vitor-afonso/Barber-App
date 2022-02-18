//jshint esversion:8
const router = require("express").Router();
const Event = require('../models/Event.model');




/******************** H O M E *********************/

router.get("/", (req, res, next) => {
  res.render("index");
});

/******************** B O O K I N G *********************/

router.get("/req-time", (req, res, next) => {  

  res.render("booking");
});

router.post("/req-time", (req, res, next) => {
  const {service, date, message, authorID} = req.body;

  res.render("confirmation");
});

/******************** B O O K I N G *********************/

module.exports = router;
