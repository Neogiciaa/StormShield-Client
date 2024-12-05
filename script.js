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

function displayWeatherData(data) {
    data.forEach((weatherData) => {
        console.log(weatherData);
    });

    createWeatherContainer(data);
}

function createWeatherContainer(weatherData) {
    const weather = document.querySelector(".weater");
    if (!weather) {return;}
    // TODO fill .weather-container h2 and ul with data
}

function autocomplete(event) {
    const searchInput = document.querySelector('#search-input');
    searchInput.value = this.innerText;
}

async function suggestCity(event) {
    const cityName = this.value.trim();
    const suggestionList = document.querySelector('#search-suggestions');

    try {
        // TODO move fetch to backend and delete API_KEY before setting the project to public
        const API_KEY = "1a85c27187a392a72295f56a04cf54bc"; // REMOVE THIS

        if (!cityName) {
            suggestionList.innerHTML = "";
        }

        if (cityName.length > 2) {
            const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=10&appid=${API_KEY}`);
            const data = await response.json();
            suggestionList.innerHTML = data.map(city => `<li data-name="${city.name}">${city.name} - ${city.country}</li>`).join("\n");

            const suggestions = Array.from(suggestionList.children);
            suggestions.forEach(suggestion => {
                suggestion.addEventListener("click", autocomplete)
            })
        }
    } catch (error) {
        console.error(error.message);
    }
}

const input = document.querySelector('#search-input');
if (input) {
    input.addEventListener('input', suggestCity);
}

const button = document.querySelector('#search-button');
if (button) {
    button.addEventListener('click', searchForCity);
}