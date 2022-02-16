//jshint esversion:8
const router = require("express").Router();
const Events = require('../models/Events.model');

/* GET home page */
router.get("/", (req, res, next) => {
  res.render("index");
});


router.post("/", (req, res, next) => {
  const {text, start_date, end_date} = req.body;
  console.log(text, start_date, end_date);
  Events
    .create({text, start_date, end_date})
    .then(event => {
      //console.log('Created event =>', event);
      res.render("index");
    })
    .catch(err => console.log(err)); 
});











// loads the events to the  calendar on start/init
router.get('/data', function (req, res) {
  Events.find()
    .then((data) => {
    //set the id property for all client records to the database records, which are stored in ._id field
    for (var i = 0; i < data.length; i++){
      data[i].id = data[i]._id;
      delete data[i]["!nativeeditor_status"];
    }
    //output response
    res.send(data);
  })
  .catch(err => console.log('Something went wrong while trying to get all events from DB =>',err));
});

router.post('/data', function (req, res) {

  let data = req.body;
  let mode = data["!nativeeditor_status"];
  let sid = data.id;
  let tid = sid;

  function update_response(err) {
    if (err)
      mode = "error";
    else if (mode == "inserted"){
      tid = data._id;
    }
    res.setHeader("Content-Type", "application/json");
    res.send({ action: mode, sid: sid, tid: String(tid) });
  }

  if (mode == "updated") {
    Events.findOneAndUpdate({"_id": data._id}, {$set: data}, update_response);
  } else if (mode == "inserted") {
    Events.create(data, update_response);
  } else if (mode == "deleted") {
    Events.findOneAndRemove({"_id": data._id}, update_response);
  } else 
    res.send("Not supported operation");
});

module.exports = router;
