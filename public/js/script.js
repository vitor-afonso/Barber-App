//jshint esversion:8
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("project-2-barber-app JS imported successfully!");
  },
  false
);

function init() {

  scheduler.config.first_hour = 9;
  scheduler.config.last_hour = 19;
  scheduler.config.xml_date = "%Y-%m-%d %H:%i";
  scheduler.init("scheduler_here", new Date(), "week");
  // enables the dynamic loading
  scheduler.setLoadMode("day");

  // load data from backend
  scheduler.load("/data", "json");
  // connect backend to scheduler
  var dp = new dataProcessor("/data");
  // set data exchange mode
  dp.init(scheduler);
  dp.setTransactionMode("POST", false);
}





