//jshint esversion:8
const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const isLoggedIn = require("../middleware/isLoggedIn");
const isUser = require("../middleware/isUser");
const fileUploader = require("../config/cloudinary.config");

function createUpdatedEvents(event) {
  let bookingInfo = {};
  bookingInfo.username = event.authorID.username;
  bookingInfo.service = event.service;
  bookingInfo.reqStatus = event.reqStatus;
  bookingInfo.contact = event.contact;
  bookingInfo.message = event.message;
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

router.get("/profile", isLoggedIn, isUser, (req, res, next) => {
  const myUserID = req.session.user._id;
  let confirmedBookings = [];
  let pendingBookings = [];
  let previousBookings = [];
  let todaysDate = new Date();
  

  User.findById(myUserID)
    .populate("events")
    .then((userFromDB) => {
      userFromDB.events.forEach((event) => {
        event.service = event.service
          .map((element) => element.split("+"))
          .map((element) => element[0]);

        if (event.startDate.getTime() < todaysDate.getTime()) {
          previousBookings.push(createUpdatedEvents(event));
        }
        if (
          event.reqStatus === "Pending" &&
          event.startDate.getTime() >= todaysDate.getTime()
        ) {
          pendingBookings.push(createUpdatedEvents(event));
        }
        if (event.reqStatus === "Confirmed" &&
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

/******************** A D M I N *********************/

router.get("/profile/admin", isLoggedIn, (req, res, next) => {
  const adminUser = req.session.user;
  let confirmedBookings = [];
  let pendingBookings = [];
  let previousBookings = [];
  let todaysDate = new Date();

  Event.find()
    .populate("authorID")
    .then((eventsFromDB) => {
      //console.log('Events from DB =>',eventsFromDB);
      eventsFromDB.forEach((event) => {
        event.service = event.service
          .map((element) => element.split("+"))
          .map((element) => element[0]);

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

      //console.log("confirmed bookings =>", confirmedBookings);

      res.render("user/profile-admin", {
        user: adminUser,
        events: eventsFromDB,
        pendingBookings,
        confirmedBookings,
        previousBookings,
      });
    })
    .catch((err) => {
      console.log("error with populate =>", err);
    });
});

/******************** P R O F I L E   E D I T *********************/

router.get("/profile/:id/edit", isLoggedIn, (req, res, next) => {
  const userID = req.params.id;

  User.findById(userID)
    .then((userFromDB) => {
      //console.log("User from DB to edit =>", userFromDB);
      
      res.render("user/profile-edit", { user: userFromDB});
    })
    .catch((err) =>
      console.log("Something went wrong while getting user from DB =>", err)
    );
});

router.post("/profile/:id/edit", isLoggedIn, isUser, fileUploader.single("profile-image"),(req, res, next) => {
    const userID = req.params.id;
    const { username, email, password, existingImage } = req.body;
    let profileImage = "";

    if (req.file !== undefined) {
      profileImage = req.file.path;
      console.log("new req file path =>", profileImage);
    } else {
      profileImage = existingImage;
      console.log("old req file path =>", profileImage);
    }

    User.findById(userID)
      .then(userFromDB => {
        if (email !== userFromDB.email) {
          User.findOne({ email }).then((found) => {
            // If the user is found, send the message email is taken
            if (found) {
              return res
                .status(400)
                .render("user/profile-edit", {
                  errorMessage: "Email already taken.",
                  user: userFromDB,
                });
            }
          });
        }

        if (password !== "********" && password !== userFromDB.password) {
          return bcrypt
            .genSalt(saltRounds)
            .then((salt) => bcrypt.hash(password, salt))
            .then((hashedPassword) => {
              // Update user and save it in the database
              User.findByIdAndUpdate(
                userID,
                {
                  username: username,
                  email: email,
                  password: hashedPassword,
                  imageUrl: profileImage.path,
                },
                { new: true }
              )
                .then((updatedUser) => {
                  console.log("Updated user with new password =>", updatedUser);
                  res.redirect("/profile");
                })
                .catch((err) =>
                  console.log(
                    "Something went wrong while updating user =>",
                    err
                  )
                );
            });
        } else {
          User.findByIdAndUpdate(
            userID,
            { username: username, email: email, imageUrl: profileImage },
            { new: true }
          )
            .then((updatedUser) => {
              console.log(
                "Updated user without changing password =>",
                updatedUser
              );
              res.redirect("/profile");
            })
            .catch((err) =>
              console.log(
                "Something went wrong while updating user password =>",
                err
              )
            );
        }
      })
      .catch((err) =>
        console.log(
          "Something went wrong while getting user from DB to update =>",
          err
        )
      );
  }
);
module.exports = router;



/******************** P R O F I L E   B O O K I N G   E D I T *********************/

router.get("/profile/:id/booking/edit", isLoggedIn, (req, res, next) => {
  const userID = req.params.id;
  
  User.findById(userID)
  .populate("events")
  .then(userFromDB => {
    console.log('User from DB in booking/edit =>',userFromDB);
    res.render('user/booking-edit-form');
  })
  .catch(err=> console.log('Something went wrong while trying to get user from DB', err));
});