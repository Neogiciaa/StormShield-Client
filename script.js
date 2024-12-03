function fetchWeatherData(lat, long) {
    navigator.geolocation.getCurrentPosition(success);
}

function success(pos) {
    var crd = pos.coords;

    const lat = crd.latitude;
    const long = crd.longitude;

    fetchWeatherData(lat, long);
}