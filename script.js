async function fetchWeatherData(lat, lon) {
    try {
        const data = await fetch(`http://localhost:3000/api/getWeatherDatas?lat=${lat}&lon=${lon}`);
        console.log(data);
    } catch (error) {
        console.error(error.message);
    }
}

async function success(pos) {
    const coordinates = pos.coords;

    const lat = coordinates.latitude;
    const lon = coordinates.longitude;
    fetchWeatherData(lat, lon);
}

navigator.geolocation.getCurrentPosition(success);