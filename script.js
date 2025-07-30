console.log("Javascript is connected!");
const searchbtn = document.getElementById('search-btn');
const locationbtn = document.getElementById('location-btn');
const cityInput = document.getElementById('city-input')
const themeToggle = document.getElementById('theme-toggle');

searchbtn.addEventListener('click', ()=> {
  console.log("🔍 Search clicked");
  const city = cityInput.value.trim();
 if(city){
    fetchWeather(city);
 }
    else{
        alert("⚠️ No city entered.");
        }
});

locationbtn.addEventListener('click', () => {
  console.log("📍 Location button clicked");

  if ("geolocation" in navigator) {
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const lat = position.coords.latitude;
        const lon = position.coords.longitude;
        console.log("📍 Got coordinates:", lat, lon);
        fetchWeatherByCoords(lat, lon); // You'll define this function
      },
      (error) => {
        console.error("❌ Geolocation error:", error);
        alert(`⚠️ Could not get your location.\nReason: ${error.message}`);
      }
    );
  } else {
    alert("❌ Geolocation is not supported by this browser.");
  }
});



themeToggle.addEventListener('click', ()=>{
   console.log("🌙 Toggle theme clicked");
    document.body.classList.toggle('dark');
});

function fetchWeather(city) {
    const apiKey = "efe47813118fbd5d0f7d5d78aa8fe45f";
    const currentUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const forecastUrl = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

    // Current Weather
    fetch(currentUrl)
        .then(response => response.json())
        .then(data => {
            document.getElementById("city-name").textContent = data.name;
            document.getElementById("temperature").textContent = `${data.main.temp}°C`;
            document.getElementById("condition").textContent = data.weather[0].description;
            document.getElementById("humidity").textContent = `${data.main.humidity}%`;
            document.getElementById("wind").textContent = `${data.wind.speed} km/h`;

            updateRecentSearches(city);
        })
        .catch(error => {
            console.error("❌ Error fetching weather:", error);
            alert("⚠️ Could not fetch weather data. Please try again.");
        });

    // 5-Day Forecast
    fetch(forecastUrl)
        .then(response => response.json())
        .then(data => {
            const forecastSection = document.querySelector("#forecast");
            forecastSection.innerHTML = ""; // Clear previous data

            const dailyForecasts = {};
            for (let item of data.list) {
                const date = item.dt_txt.split(" ")[0];
                const time = item.dt_txt.split(" ")[1];

                // Choose only 12:00 PM entries
                if (time === "12:00:00" && !dailyForecasts[date]) {
                    dailyForecasts[date] = item;
                }
            }

            Object.values(dailyForecasts).forEach(day => {
                const div = document.createElement("div");
                div.className = "forecast-day";
                div.innerHTML = `
                    <strong>${new Date(day.dt_txt).toDateString()}</strong>
                    <div>${day.main.temp}°C</div>
                    <div>${day.weather[0].description}</div>
                `;
                forecastSection.appendChild(div);
            });
        });
}


function updateRecentSearches(city){
    let searches = JSON.parse(localStorage.getItem("recentSearches")) || [];
     searches = searches.filter(item => item.toLowerCase() !== city.toLowerCase());
     searches.unshift(city);
     if(searches.length >5){
        searches.pop();
     }
      localStorage.setItem("recentSearches", JSON.stringify(searches));
 renderRecentSearches();
}

function renderRecentSearches() {
    const container = document.querySelector("#recent-searches");
    container.innerHTML = "";
    const searches = JSON.parse(localStorage.getItem("recentSearches")) || [];

    searches.forEach(city => {
        const btn = document.createElement("button");
        btn.textContent = city;
                btn.className = "recent-btn";
        btn.addEventListener("click", () => fetchWeather(city));
        container.appendChild(btn);


        const clearBtn = document.getElementById("clear-recent-btn");

clearBtn.addEventListener("click", () => {
  localStorage.removeItem("recentSearches");   
  renderRecentSearches();                      
});

    });
}

function fetchWeatherByCoords(lat, lon) {
  const apiKey = "efe47813118fbd5d0f7d5d78aa8fe45f";
  const url = `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      console.log("✅ Location Weather Data:", data);

      document.getElementById("city-name").textContent = data.name;
      document.getElementById("temperature").textContent = `${data.main.temp}°C`;
      document.getElementById("condition").textContent = data.weather[0].description;
      document.getElementById("humidity").textContent = `${data.main.humidity}%`;
      document.getElementById("wind").textContent = `${data.wind.speed} km/h`;
    })
    .catch(error => {
      console.error("❌ Error fetching weather by location:", error);
      alert("⚠️ Failed to get weather from your location.");
    });
}

