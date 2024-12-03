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

}

async function success(pos) {
    const coordinates = pos.coords;

    const lat = coordinates.latitude;
    const lon = coordinates.longitude;
    const data = fetchWeatherData(lat, lon);
}

function error() {}

navigator.geolocation.getCurrentPosition(success, error);

function searchForCity() {

}

async function autocomplete() {
    const cityName = this.value.trim();
    // TODO send to backend for autocomplete

    if (!cityName) {

        while (this.children) {
            this.removeChild(this.lastChild);
        }
    }

    const ul = document.querySelector("#alert-list");

    try {
        // TODO fetch and process data from server
        // const response = await fetch();
        const data = await response.json();
        data.forEach(city => {
            const li = document.createElement("li");
            li.value = city.name;
            ul.appendChild(li);
        });
    } catch (error) {
        console.error(error.message);
    }
}

const input = document.querySelector('#search-input');
if (input) {
    input.addEventListener('input', autocomplete);
}

const button = document.querySelector('#search-button');
if (button) {
    button.addEventListener('click', searchForCity);
}