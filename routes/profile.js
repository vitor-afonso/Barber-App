//jshint esversion:8
const router = require("express").Router();
const bcrypt = require("bcrypt");
const saltRounds = 10;
const Event = require("../models/Event.model");
const User = require("../models/User.model");
const nodemailer = require("nodemailer");
const isLoggedIn = require("../middleware/isLoggedIn");
const isUser = require("../middleware/isUser");
const fileUploader = require("../config/cloudinary.config");
const { createUpdatedEvents, editServiceName } = require("../utils/app.utils");
const { populate } = require("../models/Event.model");

/******************** P R O F I L E *********************/

router.get("/profile", isLoggedIn, isUser, (req, res, next) => {
  const userID = req.session.user._id;
  let bookingConfirmation = req.query.message;
  let message;
  if (bookingConfirmation) {
    message = "Booking request successfully sent.";
  }
  let confirmedBookings = [];
  let pendingBookings = [];
  let previousBookings = [];
  let todaysDate = new Date();
  

  User.findById(userID)
    .populate("events")
    .then((userFromDB) => {
      userFromDB.events.forEach((event) => {
        editServiceName(event);

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
      //console.log("confirmed bookings in profile =>", confirmedBookings);

      res.render("user/profile", {
        user: userFromDB,
        pendingBookings,
        confirmedBookings,
        previousBookings,
        bookingConfirmation: message
      });
    })
    .catch((err) => {
      console.log("error with populate =>", err);
    });
});

/******************** P R O F I L E   A D M I N *********************/

router.get("/profile/admin", isLoggedIn, (req, res, next) => {
  let emailConfirmation = req.query.message;

  if (emailConfirmation) {
    emailConfirmation = "Email successfully sent.";
    //console.log('email confirmation message =>',emailConfirmation);
  }

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
        editServiceName(event);

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

      res.render("user/profile-admin", {
        user: adminUser,
        events: eventsFromDB,
        pendingBookings,
        confirmedBookings,
        previousBookings,
        message: emailConfirmation,
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
      /* console.log("User from DB to edit =>", userFromDB); */

      res.render("user/profile-edit", { user: userFromDB });
    })
    .catch((err) =>
      console.log("Something went wrong while getting user from DB =>", err)
    );
});

router.post(
  "/profile/:id/edit",
  isLoggedIn,
  fileUploader.single("profile-image"),
  (req, res, next) => {
    const userID = req.params.id;
    const { username, email, password, existingImage } = req.body;
    let profileImage = "";

    
    console.log('req file state =>', req.file);

    if (req.file !== undefined) {
      profileImage = req.file.path;
      console.log("to update image with new req file path =>", profileImage);
    } else {
      profileImage = existingImage;
      console.log("to update image with old req file path =>", profileImage);
    }

    User.findById(userID)
      .then((userFromDB) => {
        if (email !== userFromDB.email) {
          User.findOne({ email }).then((found) => {
            // If the user is found, send the message email is taken
            if (found) {
              return res.status(400).render("user/profile-edit", {
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
                userID, {  username: username, email: email, password: hashedPassword, imageUrl: profileImage },
                { new: true }
              )
                .then((updatedUser) => {

                  req.session.user.imageUrl = profileImage;
                  //console.log("Updated user with new password =>", updatedUser);
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
              /* console.log("Updated user without changing password =>",  updatedUser); */

              req.session.user.imageUrl = profileImage;

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

/******************** B O O K I N G   E D I T *********************/

router.get("/profile/:id/booking/edit", isLoggedIn, (req, res, next) => {
  const eventID = req.params.id;

  let pendingBookings = [];
  let confirmedBookings = [];

  let todaysDate = new Date();

  let allServices = [
    "Haircut+60",
    "Beard+45",
    "Haircut&Beard+90",
    "Haircut&Color+120",
    "Color+75",
  ];

  Event.findById(eventID)
    .then((eventFromDB) => {
      //console.log('Event from DB to edit =>', eventFromDB );
      let selectedServices = [];
      let unselectedServices = [];

      let allUnselectedServicesNames = [];

      if (
        eventFromDB.reqStatus === "Pending" &&
        eventFromDB.startDate.getTime() >= todaysDate.getTime()
      ) {
        allServices.forEach((element, i) => {
          if (eventFromDB.service.indexOf(element) !== -1) {
            selectedServices.push({
              fullServiceName: allServices[i],
              shortServiceName: allServices[i].split("+")[0],
            });
          } else {
            unselectedServices.push({
              fullServiceName: allServices[i],
              shortServiceName: allServices[i].split("+")[0],
            });
          }
        });

        /* console.log("selectedServices after loop =>", selectedServices);
        console.log("unselectedServices after loop =>", unselectedServices); */

        eventFromDB.selectedServices = selectedServices;
        eventFromDB.unselectedServices = unselectedServices;

        editServiceName(eventFromDB);

        pendingBookings.push(createUpdatedEvents(eventFromDB));
      }

      if (
        eventFromDB.reqStatus === "Confirmed" &&
        eventFromDB.startDate.getTime() >= todaysDate.getTime()
      ) {
        allServices.forEach((element, i) => {
          if (eventFromDB.service.indexOf(element) !== -1) {
            selectedServices.push({
              fullServiceName: allServices[i],
              shortServiceName: allServices[i].split("+")[0],
            });
          } else {
            unselectedServices.push({
              fullServiceName: allServices[i],
              shortServiceName: allServices[i].split("+")[0],
            });
          }
        });

        eventFromDB.selectedServices = selectedServices;
        eventFromDB.unselectedServices = unselectedServices;

        editServiceName(eventFromDB);

        confirmedBookings.push(createUpdatedEvents(eventFromDB));
      }
      //console.log('pending booking sent to edit view =>',pendingBookings);
      res.render("events/booking-edit-form", {
        pendingBookings,
        confirmedBookings,
        bookingID: eventID,
      });
    })
    .catch((err) =>
      console.log(
        "Something went wrong while trying to get event from DB to send to edit view =>",
        err
      )
    );
});

router.post("/profile/:id/booking/edit", isLoggedIn, (req, res, next) => {
  const evendID = req.params.id;
  const { service, date, time, contact, message } = req.body;
  let minutes = 0;
  //allows us to define a end time for the booking
  minutes = [service]
    .map((element) => element.split("+"))
    .map((element) => element[1])
    .map(Number)
    .reduce((a, b) => a + b);
  let newStartDate = new Date(`${date}T${time}Z`);
  let newEndDate;
  let newReqStatus = "Pending";

  newEndDate = new Date(newStartDate.getTime() + minutes * 60000);

  Event.findByIdAndUpdate(
    evendID,
    {
      service: service,
      startDate: newStartDate,
      endDate: newEndDate,
      contact: contact,
      message: message,
      reqStatus: newReqStatus,
    },
    { new: true }
  )
    .then((updatedEvent) => {
      //console.log('newly updated event =>', updatedEvent);
      res.redirect("/profile");
    })
    .catch((err) =>
      console.log(
        "Something went wrong while trying to get event from DB to update =>",
        err
      )
    );
});

/*********************** B O O K I N G   D E L E T E *********************/

router.get("/profile/:id/booking/delete", isLoggedIn, (req, res, next) => {
  const user = req.session.user;
  const eventID = req.params.id;
  //console.log('deleting event id =>',eventID);

  Event.findByIdAndRemove(eventID)
    .then(() => {
      User.findById(user._id)
        .then((userFromDB) => {
          User.findByIdAndUpdate(user._id, {
            events: userFromDB.events.filter((event) => {
              return event._id.toString() != eventID;
            })
          }).then(() => {
            console.log("event deleted from user.events!!!");
          })
          .catch(err => console.log('Something went wrong while deleting event from user.events.'));

          if (user.role == "Admin") {
            res.redirect("/profile/admin");
          } else {
            res.redirect("/profile");
          }
        })
        .catch((err) =>
          console.log(
            "Something went wrong while trying to delete an event from =>",
            err
          )
        );
    })
    .catch((err) =>
      console.log(
        "Something went wrong while trying to delete an event =>",
        err
      )
    );
});

/*********************** B O O K I N G  C O N F I R M  *********************/

router.get("/profile/:id/booking/confirm", isLoggedIn, (req, res, next) => {
  const eventID = req.params.id;
  //console.log('deleting event id =>',eventID);

  Event.findByIdAndUpdate(eventID, { reqStatus: "Confirmed" }, { new: true })
    .then((updatedEvent) => {
      //console.log('new confirmed event =>',updatedEvent);
      res.redirect("/profile/admin");
    })
    .catch((err) =>
      console.log(
        "Something went wrong while trying to confirm an event =>",
        err
      )
    );
});

/*********************** S E N D   E M A I L *********************/

router.get("/send-email/:id", (req, res, next) => {
  const eventID = req.params.id;
  let pendingBookings = [];

  Event.findById(eventID)
    .populate("authorID")
    .then((eventFromDB) => {
      pendingBookings.push(createUpdatedEvents(eventFromDB));

      console.log("pending booking to send email", pendingBookings);

      res.render("events/email-form", { pendingBookings });
    })
    .catch((err) =>
      console.log(
        "Something went wrong while trying to get event to send email =>",
        err
      )
    );
});

router.post("/send-email", (req, res, next) => {
  let { email, subject, message } = req.body;
  console.log("req.body", req.body);
  let transporter = nodemailer.createTransport({
    service: "Gmail",
    auth: {
      user: "ironhackbarberapp@gmail.com",
      pass: "!ronhackbarberapp22",
    },
  });

  transporter
    .sendMail({
      from: "ironhackbarberapp@gmail.com",
      to: email,
      subject: subject,
      text: message,
      html: `<b>${message}</b>`,
    })
    .then((info) => {
      console.log("email info =>", info);
      //allows me to use redirect and have the message to display
      res.redirect("profile/admin?message=email+sent");
     
    })
    .catch((err) =>
      console.log("Something went wrong while trying to send email =>", err)
    );
});
