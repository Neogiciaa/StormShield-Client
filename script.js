document.addEventListener('DOMContentLoaded', () => {
    const modal = document.querySelector('.geolocation-modal');
    const geolocationButton = document.getElementById('geolocation-btn');

    const storedLat = localStorage.getItem('latitude');
    const storedLon = localStorage.getItem('longitude');

    if (storedLat && storedLon) {
        fetchWeatherData(storedLat, storedLon);
        modal.style.display = 'none';
    } else {
        document.documentElement.classList.add('no-scroll');
        document.body.classList.add('no-scroll');

        geolocationButton.addEventListener('click', () => {
            navigator.geolocation.getCurrentPosition(
                (pos) => handleGeolocationSuccess(pos, modal),
                () => handleGeolocationError(modal)
            );
        });
    }
});

async function handleGeolocationSuccess(pos, modal) {
    modal.style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');

    const coordinates = pos.coords;
    const lat = coordinates.latitude;
    const lon = coordinates.longitude;

    localStorage.setItem('latitude', lat);
    localStorage.setItem('longitude', lon);

    await fetchWeatherData(lat, lon);
}

function handleGeolocationError(modal) {
    modal.style.display = 'none';
    document.documentElement.classList.remove('no-scroll');
    document.body.classList.remove('no-scroll');

    document.querySelector('.search-input').style.display = 'block';
    document.querySelector('.hero-banner').style.display = 'flex';
    document.querySelector('.alerts').style.display = 'flex';
}

async function fetchWeatherData(lat, lon) {
    try {
        const response = await fetch(`http://localhost:3000/api/getWeatherDatas?lat=${lat}&lon=${lon}`);
        const data = await response.json();
        displayWeatherData(data);
    } catch (error) {
        console.error(error.message);
    }
}

async function displayWeatherData(data) {
    data.forEach((weatherData) => {
        console.log(weatherData);
    });
}

const input = document.querySelector('#search-input');
if (input) {
    input.addEventListener('input', autocomplete);
}

const button = document.querySelector('#search-button');
if (button) {
    button.addEventListener('click', searchForCity);
}