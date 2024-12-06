document.addEventListener('DOMContentLoaded', () => {
    const suggestionList = document.querySelector('#search-suggestions');
    if (!suggestionList.children.length) {
        suggestionList.classList.add('hidden');
    }

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
        displayWeatherData(data.weatherDataFormatted);
        fetchAlerts(lat, lon);
    } catch (error) {
        console.error(error.message);
    }
}

async function fetchWeatherDataByCityName(cityName) {
    try {
        const response = await fetch(`http://localhost:3000/api/getWeatherDatasByCityName?q=${cityName}`);
        const data = await response.json();
        displayWeatherData(data.weatherDataFormatted);
    } catch (error) {
        console.error(error.message);
    }
}

const btn = document.querySelector('.geof');
btn.addEventListener('click', async (e) => {
    console.log("Btn clicked")
    try {
        const response = await axios.post('http://localhost:3000/api/createDangerZone');
        console.log("Post fini")
        const res = await response.json();
        console.log("Res -> ", res.status);
    } catch (error) {
        console.log("error -> ", error);
    }
})

function displayWeatherData(data) {
    const results = document.querySelector('.weather-container');

    results.innerHTML = data.map(day => {
        const dateObj = new Date(day.date);
        const formattedDate = new Intl.DateTimeFormat('fr-FR', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        }).format(dateObj);

        return `
        <section class="weather-card">
            <h3>${formattedDate}</h3>
            <p><b>Nuages :</b> ${day.cloud}%</p>
            <p><b>Pression :</b> ${day.pressure} hPa</p>
            <p><b>Température :</b> ${day.temperature}°C</p>
            <p><b>Pluie :</b> ${day.rain} mm</p>
            <p><b>Neige :</b> ${day.snow} mm</p>
            <p><b>Vent :</b> ${day.wind} km/h</p>
        </section>
    `;
    }).join('');

}

async function autocomplete(event) {
    const searchInput = document.querySelector('#search-input');
    searchInput.value = this.innerText;
    const suggestionInput = document.querySelector('#search-suggestions');

    const city = event.target;
    const cityName = city.getAttribute("data-name");
    searchInput.value = cityName;

    const lat = localStorage.getItem('latitude');
    const lon = localStorage.getItem('longitude');

    if (cityName.length > 1) {
        await fetchWeatherDataByCityName(cityName);
        await fetchAlerts(lat, lon);
    }

    suggestionInput.innerHTML = '';
    suggestionInput.classList.add('hidden');
    event.preventDefault();
}

const searchInput = document.querySelector('#search-input');
searchInput.addEventListener('input', suggestCity);

async function suggestCity() {
    const cityName = this.value.trim();
    const suggestionList = document.querySelector('#search-suggestions');

    try {
        const API_KEY = "1a85c27187a392a72295f56a04cf54bc"; // REMOVE THIS

        if (!cityName) {
            suggestionList.innerHTML = "";
            suggestionList.classList.add('hidden');
            return;
        }

        if (cityName.length > 1) {
            const response = await fetch(`http://api.openweathermap.org/geo/1.0/direct?q=${cityName}&limit=10&appid=${API_KEY}`);
            const data = await response.json();

            suggestionList.innerHTML = data.map(city => `<li data-name="${city.name}">${city.name} - ${city.country}</li>`).join("\n");

            if (suggestionList.children.length > 0) {
                suggestionList.classList.remove('hidden');
            } else {
                suggestionList.classList.add('hidden');
            }

            const suggestions = Array.from(suggestionList.children);
            suggestions.forEach(suggestion => {
                suggestion.addEventListener("click", autocomplete);
            });
        }
    } catch (error) {
        console.error(error.message);
    }
}

const signalBtn = document.querySelector('#alert-user');
signalBtn.addEventListener('click', () => {
    const modal = document.querySelector('.custom-alert-modal');
    modal.style.display = 'flex';
    createCustomAlertModal();
})

function createCustomAlertModal() {
    const desc = document.querySelector('#custom-alert-description');
    const emp = document.querySelector('#custom-alert-location');
    const dat = document.querySelector('#custom-alert-date');
    const createAlert = document.querySelector('#custom-alert-btn');

    createAlert.addEventListener('click', (event) => {
        event.preventDefault();

        if (!desc.value || !emp.value || !dat.value) {
            return;
        }

        const list = document.querySelector('.custom-alert-list');
        list.innerHTML = '';

        const li = document.createElement('li');
        li.innerHTML = `
            <p>${emp.value} - ${desc.value} - ${dat.value}</p>
        `;

        list.appendChild(li);

        const modal = document.querySelector('.custom-alert-modal');
        modal.style.display = 'none';
    });

    desc.value = '';
    emp.value = '';
    dat.value = '';
}

async function fetchAlerts(lat, lon) {
    try {
        const response = await axios.get(`http://localhost:3000/api/getAlerts?lat=${lat}&lon=${lon}`);

        const alerts = response.data;

        const dataContainer = document.querySelector('.medium-alert-list');

        if (alerts.length === 0) {
            dataContainer.innerHTML = `<p>Pas d'alerte détectée pour le moment !</p>`;
            return;
        }

        dataContainer.innerHTML = alerts.map(alert => {
            return `
                <li class="weather-card">
                    <p>${alert.name} - ${alert.intensity} </p>
                </li>
            `;
        }).join('');

    } catch (error) {
        console.error("Erreur lors de la récupération des alertes :", error);
    }
}

async function fetchCustomAlerts() {
    try {
        const response = await axios.get('http://localhost:3000/api/getAllWarningAlert');
        const alerts = response.data;

        const customAlertsContainer = document.querySelector('.custom-alert-list');

        customAlertsContainer.innerHTML = '';

        if (alerts.length === 0) {
            customAlertsContainer.innerHTML = `<p>Pas d'indicent rapporté pour le moment !</p>`;
            return;
        }

        customAlertsContainer.innerHTML = alerts.map(alert => {
            return `
            <li>
                <p>${alert.description} - Votes : ${alert.vote}</p>
                <picture>
                    <img src="img/thumbsup.svg" alt="thumbsup" />
                    <img src="img/thumbsdown.svg" alt="thumbsdown" />
                </picture>
            </li>
            `;
        }).join('');

        fetchNotifications();

    } catch (error) {
        console.error(error.message);
    }
}

fetchCustomAlerts();

async function fetchNotifications() {
    try {
        const response = await axios.get('https://sink-server-hackaton.vercel.app/sinks');
        const notifications = response.data;

        const notificationContainer = document.querySelector('.notifications-container');

        notificationContainer.innerHTML = '';

        notifications.forEach(notification => {
            const eventType = notification.type.includes('subscription-ends')
                ? 'Sortie de zone de danger, vous êtes en sécurité'
                : 'Entrée dans une zone de danger';

            const notifHtml = `
                <li>
                    ${eventType} - Le ${new Date(notification.time).toLocaleString()}
                </li>
            `;

            notificationContainer.innerHTML += notifHtml;
        });

    } catch (error) {
        console.error('Erreur lors de la récupération des notifications:', error);
    }
}
