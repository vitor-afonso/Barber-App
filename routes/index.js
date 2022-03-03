//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");

/******************** H O M E *********************/

router.get("/", (req, res, next) => {
  const user = req.session.user;
  console.log("-->", user);
  res.render("index", { user });
});

module.exports = router;
