const weather_codes = {
  0:  { label: "Clear", img: "./assets/images/icon-sunny.webp" },
  1:  { label: "Mostly Clear", img: "./assets/images/icon-sunny.webp" },
  2:  { label: "Partly Cloudy", img: "./assets/images/icon-partly-cloudy.webp" },
  3:  { label: "Cloudy", img: "./assets/images/icon-overcast.webp" },

  45: { label: "Fog", img: "./assets/images/icon-fog.webp" },
  48: { label: "Rime Fog", img: "./assets/images/icon-sunny.webp" },

  51: { label: "Light Drizzle", img: "./assests/images/icon-drizzle.webp" },
  53: { label: "Drizzle", img: "./assests/images/icon-drizzle.webp" },
  55: { label: "Heavy Drizzle", img: "./assests/images/icon-drizzle.webp" },

  56: { label: "Freezing Drizzle", img: "./assets/images/icon-snow.webp" },
  57: { label: "Heavy Freezing Drizzle", img: "./assets/images/icon-snow.webp" },

  61: { label: "Light Rain", img: "./assets/images/icon-rain.webp" },
  63: { label: "Rain", img: "./assets/images/icon-rain.webp" },
  65: { label: "Heavy Rain", img: "./assets/images/icon-rain.webp" },

  66: { label: "Freezing Rain", img: "./assets/images/icon-rain.webp" },
  67: { label: "Heavy Freezing Rain", img: "./assets/images/icon-rain.webp" },

  71: { label: "Light Snow", img: "./assets/images/icon-snow.webp" },
  73: { label: "Snow", img: "./assets/images/icon-snow.webp" },
  75: { label: "Heavy Snow", img: "./assets/images/icon-snow.webp" },

  77: { label: "Snow Grains", img: "./assets/images/icon-snow.webp" },

  80: { label: "Light Showers", img: "./assets/images/icon-rain.webp" },
  81: { label: "Showers", img: "./assets/images/icon-rain.webp" },
  82: { label: "Heavy Showers", img: "./assets/images/icon-drizzle.webp" },

  85: { label: "Light Snow Showers", img: "./assets/images/icon-snow.webp" },
  86: { label: "Heavy Snow Showers", img: "./assets/images/icon-snow.webp" },

  95: { label: "Thunderstorm", img: "./assets/images/icon-storm.webp" },
  96: { label: "Thunderstorm + Small Hail", img: "./assets/images/icon-storm.webp" },
  99: { label: "Thunderstorm + Heavy Hail", img: "./assets/images/icon-storm.webp" }
};



console.log(weather_codes[2].label);

const searchInput = document.querySelector("#searchInput");
const searchBtn = document.querySelector("#searchBtn");
const details = document.querySelector(".details");
const currentTemperature = document.querySelector(".temperature");
const dispalyLocation = document.querySelector(".location");
const apparentTemperature = document.querySelector("#feelsLike");
const displayHumidity = document.querySelector("#Humidity");
const displayWindSpeed = document.querySelector("#windSpeed");
const displayPrecipitation = document.querySelector("#precipitation");
const unitsBtn = document.getElementById("unitsBtn");
const unitsMenu = document.getElementById("unitsMenu");
const items = document.querySelectorAll(".dropdown-item");


let units = {
  temp: "celsius",
  wind: "kmh",
  precip: "mm"
};

var lastLocation = "";
let globalHourly = null;

 
unitsBtn.addEventListener("click", () => {
  unitsMenu.classList.toggle("open");
});

// Close when clicking outside
document.addEventListener("click", (e) => {
  if (!unitsMenu.contains(e.target) && !unitsBtn.contains(e.target)) {
    unitsMenu.classList.remove("open");
  }
});

// Option selection logic
items.forEach(item => {
  item.addEventListener("click", () => {
    const type = item.dataset.type;
    const value = item.dataset.value;

    document.querySelectorAll(`.dropdown-item[data-type="${type}"]`)
      .forEach(el => el.classList.remove("selected"));
    item.classList.add("selected");

    units[type] = value;
    console.log("Units updated:", units);

    getLocation(lastLocation);
  });
});


function formatDate(date = new Date()){
    const days = ["Sunday", "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday"];
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    const getDay = days[date.getDay()];
    const getDate = date.getDate();
    const getMonth = months[date.getMonth()];

    return `${getDay}, ${getDate} ${getMonth}`
}


searchBtn.addEventListener('click', async ()=>{
    lastLocation = searchInput.value.trim();
    getLocation(lastLocation);
})

async function getLocation(location) {
    const response = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${location}&count=10&language=en&format=json`);
    const data = await response.json();

    if (!data.results || data.results.length === 0) {
        throw new Error("Location not found");
    }
    console.log(data);
    const result = data.results[0];

    dispalyLocation.innerHTML = `<h2>${result.name}, ${result.country}</h2>
                                <p>${formatDate()}</p>`;

    getWeather(result.latitude, result.longitude);

}

async function getWeather(lat, lon) {
    const response = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&current=wind_speed_10m,is_day,apparent_temperature,relative_humidity_2m,temperature_2m,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_min,temperature_2m_max&temperature_unit=${units.temp}&wind_speed_unit=${units.wind}&precipitation_unit=${units.precip}`);    const data = await response.json();
    console.log(data);
    const current = data.current;
    const hourly = data.hourly;
    const currentUnits = data.current_units;
    globalHourly = hourly;

    displayCurrentWeather(current, currentUnits);
    displayweeklyWeather(data.daily);
    displayHourlyWeather(hourly);
    populateDayDropdown(hourly);
}

function displayCurrentWeather(current, currentUnits){
    const temperature = Math.round(current.temperature_2m);
    const weather_code = current.weather_code;
    const feelsLike = Math.round(current.apparent_temperature);
    const humidity = current.relative_humidity_2m;
    const windSpeed = Math.round(current.wind_speed_10m);
    const precipitation = Math.round(current.precipitation);
    const windSpeedUnits = currentUnits.wind_speed_10m;
    const precipitationUnits = currentUnits.precipitation;
    
    currentTemperature.innerHTML = `<img src=${weather_codes[weather_code].img} alt=${weather_codes[weather_code].label}>
                                    <h2>${temperature}°</h2>`;

    apparentTemperature.innerHTML = `${feelsLike}°`;
    displayHumidity.innerHTML = `${humidity}%`;
    displayWindSpeed.innerHTML = `${windSpeed} ${windSpeedUnits}`;
    displayPrecipitation.innerHTML = `${precipitation} ${precipitationUnits}`;
}

function displayweeklyWeather(daily){
    const count = 7;
    for (let i = 0; i < count; i++){
        const day = getcurrentDay(daily.time[i]);
        const min = Math.round(daily.temperature_2m_min[i]);
        const max = Math.round(daily.temperature_2m_max[i]);
        const weather_code = daily.weather_code[i];

        const dailyForecast = document.querySelector(`#forecast${i}`);
        dailyForecast.innerHTML = `<h3>${day}</h3>
                                <img src=${weather_codes[weather_code].img} alt=${weather_codes[weather_code].label}>
                                <div>
                                    <p>${max}°</p> 
                                    <p>${min}°</p>
                                </div>`;
    }
    
}

function getcurrentDay(isoString){
    if (!isoString) return "N/A";
    const date = new Date(isoString);
    const days = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    return days[date.getDay()];
}

function displayHourlyWeather(hourly){
    let dayCount = [0, 24, 48, 72, 96, 120, 144, 168];

    const count = 24;
    for (let i = 0; i < count; i++){
        const time = getcurrentHour(hourly.time[i]);
        const temperature = Math.round(hourly.temperature_2m[i]);
        const weather_code = hourly.weather_code[i];
        const hourlyForecast = document.querySelector(`#hour${i}`);
        hourlyForecast.innerHTML = `<div>
                                    <img src=${weather_codes[weather_code].img} alt=${weather_codes[weather_code].label}>
                                    <h3>${time}</h3>
                                    </div>
                                    <p>${temperature}°</p>`;
    }
}

function getcurrentHour(isoString){
    const date = new Date(isoString);
    let hours = date.getHours();
    let ampm = hours >= 12 ? 'PM' : 'AM';

    hours = hours % 12;
    hours = hours ? hours : 12;

    let strTime = hours +' ' + ampm;
    return strTime;
}

function setupDayDropdown() {
    const dayHeader = document.getElementById("day-hourlyForecast");

    // Create hidden dropdown
    const dropdown = document.createElement("div");
    dropdown.id = "dayDropdownMenu";
    dropdown.style.display = "none";
    dropdown.style.position = "absolute";
    dropdown.style.background = "hsl(243, 23%, 24%)";
    dropdown.style.border = "1px solid hsl(243, 23%, 30%)";
    dropdown.style.borderRadius = "6px";
    dropdown.style.marginTop = "5px";
    dropdown.style.zIndex = "20";

    const days = ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"];

    days.forEach((day, index) => {
        const opt = document.createElement("p");
        opt.textContent = day;
        opt.style.padding = "6px 14px";
        opt.style.cursor = "pointer";

        opt.addEventListener("mouseenter", () => opt.style.background = "hsl(243, 23%, 30%)");
        opt.addEventListener("mouseleave", () => opt.style.background = "transparent");

        opt.addEventListener("click", () => {
            dayHeader.childNodes[0].textContent = day + " ";
            dropdown.style.display = "none";

            // Load hourly forecast for selected day
            loadHourlyForecastForDay(index, window.hourlyCache);
        });

        dropdown.appendChild(opt);
    });

    dayHeader.style.position = "relative";
    dayHeader.appendChild(dropdown);

    // Toggle dropdown on clicking header
    dayHeader.addEventListener("click", () => {
        dropdown.style.display = dropdown.style.display === "none" ? "block" : "none";
    });

    // Click outside → close
    document.addEventListener("click", (e) => {
        if (!dayHeader.contains(e.target)) {
            dropdown.style.display = "none";
        }
    });
}

/* --------------------------------------------------
   2) Group hourly data into days
-------------------------------------------------- */

function groupHoursByDay(hourly) {
    const { time, temperature_2m, weather_code } = hourly;
    const daysData = {};

    for (let i = 0; i < time.length; i++) {
        const date = new Date(time[i]);
        const day = date.getDay(); // 0–6

        if (!daysData[day]) {
            daysData[day] = [];
        }

        daysData[day].push({
            time: time[i],
            temp: temperature_2m[i],
            code: weather_code[i]
        });
    }

    return daysData;
}

/* --------------------------------------------------
   3) Render 24-hour forecast for selected day
-------------------------------------------------- */

function loadHourlyForecastForDay(dayIndex, hourly) {
    if (!hourly) return;

    const daysData = groupHoursByDay(hourly);
    const hours = daysData[dayIndex];

    if (!hours) return;

    for (let i = 0; i < 24; i++) {
        const box = document.getElementById(`hour${i}`);
        if (!box) continue;

        const hourData = hours[i];
        if (!hourData) continue;

        const date = new Date(hourData.time);
        const timeFormatted = date.toLocaleTimeString([], { hour: "numeric" });

        box.innerHTML = `
            <div>
                <img src="${weather_codes[hourData.code].img}" width="35" />
                <h3>${timeFormatted}</h3>
            </div>
            <p>${Math.round(hourData.temp)}°</p>
        `;
    }
}

/* --------------------------------------------------
   4) Hook into your existing getWeather()
-------------------------------------------------- */

async function getWeather(lat, lon) {
    const response = await fetch(
        `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&hourly=temperature_2m,weather_code&current=wind_speed_10m,is_day,apparent_temperature,relative_humidity_2m,temperature_2m,precipitation,rain,showers,snowfall,weather_code,cloud_cover,pressure_msl,surface_pressure,wind_direction_10m,wind_gusts_10m&daily=weather_code,temperature_2m_min,temperature_2m_max&temperature_unit=${units.temp}&wind_speed_unit=${units.wind}&precipitation_unit=${units.precip}`
    );

    const data = await response.json();

    const hourly = data.hourly;
    window.hourlyCache = hourly; 

    const todayIndex = new Date(hourly.time[0]).getDay();

    document.getElementById("day-hourlyForecast").childNodes[0].textContent =
        ["Sunday","Monday","Tuesday","Wednesday","Thursday","Friday","Saturday"][todayIndex] + " ";

    loadHourlyForecastForDay(todayIndex, hourly);

    displayCurrentWeather(data.current, data.current_units);
    displayweeklyWeather(data.daily);
}


window.addEventListener("DOMContentLoaded", setupDayDropdown);