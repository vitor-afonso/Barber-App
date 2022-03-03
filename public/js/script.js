//jshint esversion:8
document.addEventListener(
  "DOMContentLoaded",
  () => {
    console.log("project-2-barber-app JS imported successfully!");
  },
  false
);

// TO ADD A MAP

function startMap() {
  const ironhackLSB = {
  	lat: 38.71164557730083,
  	lng: -9.124221731921713};
  const map = new google.maps.Map(
    document.getElementById('map'),
    {
      zoom: 15,
      center: ironhackLSB
    }
  );
  // TO ADD A MARKER IN THE MAP
  const myMarker = new google.maps.Marker({
    position: {
      lat: 38.71164557730083,
      lng: -9.124221731921713
    },
    map: map,
    title: "Ironhack Barber-App Development"
  });
}

startMap();



