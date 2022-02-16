//jshint esversion:8
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("project-2-barber-app JS imported successfully!");
  },
  false
);

function init() {

  //To add the ability to add, edit, and delete events
  //this defines the format the dates will take while going back to the server.
  scheduler.config.xml_date="%Y-%m-%d %H:%i";

  scheduler.config.first_hour = 9;
  scheduler.config.last_hour = 19;
  scheduler.init("scheduler_here", new Date(), "week");
  
  // defines how to parse dates from the incoming data. dates are stored as timestamps and we can convert them into date objects through Date constructor
  scheduler.templates.xml_date = function(value){ return new Date(value); };
  scheduler.load("/data", "json");

  
  //initializes dataprocessor and switches it to the mode of simple POST sending.
  var dp = new dataProcessor("/data");
    dp.init(scheduler);
    dp.setTransactionMode("POST", false);

}





