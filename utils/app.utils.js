//jshint esversion:8

function createUpdatedEvents(event) {
  let bookingInfo = {};
  bookingInfo.username = event.authorID.username;
  bookingInfo.service = event.service;
  bookingInfo.reqStatus = event.reqStatus;
  bookingInfo.contact = event.contact;
  bookingInfo.message = event.message;
  bookingInfo.id = event.id;
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
  bookingInfo.selectedServices = event.selectedServices;
  bookingInfo.unselectedServices = event.unselectedServices;
  bookingInfo.allUnselectedServicesNames = event.allUnselectedServicesNames;
  return bookingInfo;
  
}

function editServiceName(event){

    event.service = event.service
        .map((element) => element.split("+"))
        .map((element) => element[0]);
}

exports.createUpdatedEvents = createUpdatedEvents;
exports.editServiceName = editServiceName;