//jshint esversion:8
const router = require("express").Router();
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedOut = require("../middleware/isLoggedOut");
const isLoggedIn = require("../middleware/isLoggedIn");

/******************** P R O F I L E *********************/

router.get("/profile", isLoggedIn, (req, res, next) => {
    const myUser = req.session.user;
    const myUserID=req.session.user._id;
  User.findById(myUserID)
  .populate('events')
  .then(userFromDB => {
    console.log('User fom DB with populate',userFromDB);
    res.render("user/profile", {user: userFromDB});
  })  
  .catch(err=>{
      console.log('error with populate =>',err);
  });
  
});

module.exports = router;