
import { setBackgroundByTimeAndDevice } from "./background.js";
import { getLocalTimeFromServer } from "./api.js";
import { getIsCurrentLocation } from "./uiHelpers.js";



// Update Weather
export async function updateCurrentWeather(data) {
    const timezoneOffset = data.city.timezone; 

    const weather = data.list[0].weather[0];
    const windSpeed = data.list[0].wind.speed;
    const rain = data.list[0].rain?.['3h'] ?? 0;
    const windKmH = (windSpeed * 3.6).toFixed(1); 

    const localData = await getLocalTimeFromServer(timezoneOffset);
    
    const dateStr = localData.date;
    const timeStr = localData.time;
    
    const iconFile = getWeatherIcon(weather.main, localData.hour);
    setBackgroundByTimeAndDevice(localData.hour);

    document.querySelector('.date1').textContent = `${localData.weekday}, ${timeStr}`;
    document.querySelector('.date2').textContent = dateStr;
    document.querySelector('.temp .value').textContent = `${Math.round(data.list[0].main.temp)}°C`;
    document.querySelector('.temp .city').textContent = getIsCurrentLocation() ? `📍 ${data.city.name}` : data.city.name;
    document.getElementById('weather-icon').src = `Images/Icons/${iconFile}`;

    document.getElementById('water-icon').src = '/Images/Icons/water.svg';
    document.getElementById('winds-icon').src = '/Images/Icons/winds.svg';
    document.getElementById('weather-icon').style.visibility = 'visible';

    document.getElementById('rain-amount').textContent = `${rain} mm`;
    document.getElementById('wind-speed').textContent = `${windKmH} km/h`;
}



export async function updateForecast(data) {
    const dayElements = document.querySelectorAll('.day');
    let shownDays = 0;
    const timezoneOffset = data.city.timezone;

    const rainPerDay = {};
    const windPerDay = {};

    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i];
      const utc = new Date(item.dt * 1000);
      const localTime = new Date(utc.getTime() + timezoneOffset * 1000);
      const dateKey = localTime.toISOString().split('T')[0];

      const rain = item.rain?.['3h'] ?? 0;
      rainPerDay[dateKey] = (rainPerDay[dateKey] || 0) + rain;

      const windSpeed = item.wind.speed;
      if (!windPerDay[dateKey]) {
        windPerDay[dateKey] = { total: 0, count: 0 };
      }
      windPerDay[dateKey].total += windSpeed;
      windPerDay[dateKey].count += 1;
    }

    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i];
      const weather = item.weather[0];
      
      const utc = new Date(item.dt * 1000);
      const localTime = new Date(utc.getTime() + timezoneOffset * 1000);
      const localHour = localTime.getHours();

      if (localHour === 11 || localHour === 12 || localHour === 13 ) {
        const iconFile = getWeatherIcon(weather.main, localHour);

        const dateKey = localTime.toISOString().split('T')[0];

        const rain = rainPerDay[dateKey]?.toFixed(1) ?? '0';

        const windAvg = windPerDay[dateKey]?.total / windPerDay[dateKey]?.count || 0;
        const windKmH = (windAvg * 3.6).toFixed(1);

        const dayName = localTime.toLocaleDateString('en-US', { weekday: 'long' });
        const dateStr = localTime.toLocaleDateString('en-GB');
        const temp = `${Math.round(item.main.temp)}°C`;
        const desc = weather.main;

        const dayElement = dayElements[shownDays];
        if (!dayElement) break;

        dayElement.querySelector('.value').textContent = temp;
        dayElement.querySelector('.desc').textContent = desc;
        dayElement.querySelector('.forecast-icon').src = `Images/Icons/${iconFile}`;
        dayElement.querySelector('.forecast-water-icon').src = '/Images/Icons/water.svg';
        dayElement.querySelector('.forecast-winds-icon').src = '/Images/Icons/winds.svg';
        dayElement.querySelector('.forecast-rain-amount').textContent = `${rain} mm`;
        dayElement.querySelector('.forecast-wind-speed').textContent = `${windKmH} km/h`;
        dayElement.querySelector('.dayy').textContent = dayName;
        dayElement.querySelector('.dayyy').textContent = dateStr;

        shownDays++;
      }
    }
}


// Weather Icon
function getWeatherIcon(main , hour) {
    const isNight = hour < 6 || hour >= 19;
    const time = isNight ? 'night' : 'day';

    const map = {
      Clear: `clear-${time}.svg`,
      Clouds: `clouds-${time}.svg`,
      Rain: `rain-${time}.svg`,
      Drizzle: `rain-${time}.svg`,
      Thunderstorm: `thunderstorm.svg`,
      Snow: `snow.svg`,
      Mist: `clouds-${time}.svg`,
      Fog: `clouds-${time}.svg`,
      Haze: `clouds-${time}.svg`,
      Dust: `clouds-${time}.svg`,
      Smoke: `clouds-${time}.svg`,
      Sand: `clouds-${time}.svg`,
      Ash: `clouds-${time}.svg`,
      Squall: `clouds-${time}.svg`,
      Tornado: `clouds-${time}.svg`,
    };

    return map[main] || `default-${time}.svg`;
}