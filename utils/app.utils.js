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
  //bookingInfo.eventMonth = event.startDate.getMonth() + 1;
  //to add a 0 when the MONTH is only one digit
  if (event.startDate.getMonth() <= 9) {
    bookingInfo.eventMonth = `${0}${event.startDate.getMonth()}`;
  } else {
    bookingInfo.eventMonth = event.startDate.getMonth();
  }
  //to add a 0 when the DAY is only one digit
  if (event.startDate.getDate() <= 9) {
    bookingInfo.eventDay = `${0}${event.startDate.getDate()}`;
  } else {
    bookingInfo.eventDay = event.startDate.getDate();
  }
  //to add a 0 when the HOUR is only one digit
  if (event.startDate.getHours() <= 9) {
    bookingInfo.eventHour = `${0}${event.startDate.getHours()}`;
  } else {
    bookingInfo.eventHour = event.startDate.getHours();
  }
  //to add a 0 when the MINUTES is only one digit
  if (event.startDate.getMinutes() <= 9) {
    bookingInfo.eventMin = `${0}${event.startDate.getMinutes()}`;
  } else {
    bookingInfo.eventMin = event.startDate.getMinutes();
  }
  bookingInfo.startDate = event.startDate;
  bookingInfo.endDate = event.endDate;
  bookingInfo.selectedServices = event.selectedServices;
  bookingInfo.unselectedServices = event.unselectedServices;
  
  return bookingInfo;
}

function editServiceName(event){

    event.service = event.service
        .map((element) => element.split("+"))
        .map((element) => element[0]);
}

exports.createUpdatedEvents = createUpdatedEvents;
exports.editServiceName = editServiceName;