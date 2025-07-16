  let isCurrentLocation = false;
  
  // Warning Box
  function showWarningBox() {
    // Show only once per user using localStorage
    if (!localStorage.getItem('locationWarningShown')) {
      const box = document.getElementById('location-warning');
      if (box) box.style.display = 'block';
      localStorage.setItem('locationWarningShown', 'true');
    }
  }
  function dismissWarning() {
    const box = document.getElementById('location-warning');
    if (box) box.style.display = 'none';
  }

  // Spinner
  function showSpinner() {
    document.getElementById('spinner').style.display = 'flex';
  }
  function hideSpinner() {
    document.getElementById('spinner').style.display = 'none';
  }


  // Background Image
  async function setBackgroundByTimeAndDevice(hour) {
    // const isMobile = window.innerWidth <= 950;
    // let timeOfDay;

    // if (hour >= 6 && hour < 17) timeOfDay = 'day';
    // else if (hour >= 17 && hour < 19) timeOfDay = 'sunset';
    // else timeOfDay = 'night';

    // const deviceType = isMobile ? 'mobile' : 'laptop';

    // const imagePaths = {
    //   laptop: {
    //     day: [
    //       '/Images/laptop/day/1.webp',
    //       '/Images/laptop/day/2.webp',
    //       '/Images/laptop/day/3.webp',
    //       '/Images/laptop/day/4.webp',
    //       '/Images/laptop/day/5.webp',
    //       '/Images/laptop/day/6.webp'
    //     ],
    //     sunset: [
    //       '/Images/laptop/sunset/1.webp',
    //       '/Images/laptop/sunset/2.webp',
    //       '/Images/laptop/sunset/3.webp',
    //       '/Images/laptop/sunset/4.webp',
    //       '/Images/laptop/sunset/5.webp',
    //       '/Images/laptop/sunset/6.webp',
    //       '/Images/laptop/sunset/7.webp',
    //       '/Images/laptop/sunset/8.webp',
    //       '/Images/laptop/sunset/9.webp',
    //       '/Images/laptop/sunset/10.webp'

    //     ],
    //     night: [
    //       '/Images/laptop/night/1.webp',
    //       '/Images/laptop/night/2.webp',
    //       '/Images/laptop/night/3.webp',
    //       '/Images/laptop/night/4.webp',
    //       '/Images/laptop/night/5.webp',
    //       '/Images/laptop/night/6.webp',
    //       '/Images/laptop/night/7.webp',
    //       '/Images/laptop/night/8.webp',
    //       '/Images/laptop/night/9.webp'
    //     ]
    //   },
    //   mobile: {
    //     day: [
    //       '/Images/mobile/day/1.webp',
    //       '/Images/mobile/day/2.webp',
    //       '/Images/mobile/day/3.webp',
    //       '/Images/mobile/day/4.webp',
    //       '/Images/mobile/day/5.webp'
    //     ],
    //     sunset: [
    //       '/Images/mobile/sunset/1.webp',
    //       '/Images/mobile/sunset/2.webp',
    //       '/Images/mobile/sunset/3.webp'
    //     ],
    //     night: [
    //       '/Images/mobile/night/1.webp',
    //       '/Images/mobile/night/2.webp',
    //       '/Images/mobile/night/3.webp',
    //       '/Images/mobile/night/4.webp',
    //       '/Images/mobile/night/5.webp',
    //       '/Images/mobile/night/6.webp',
    //       '/Images/mobile/night/7.webp',
    //       '/Images/mobile/night/8.webp'
    //     ]
    //   }
    // };

    // const images = imagePaths[deviceType][timeOfDay];
    // const randomImage = images[Math.floor(Math.random() * images.length)];

    // const imageLoadPromise = new Promise((resolve) => {
    //   const img = new Image();
    //   img.src = randomImage;
    //   img.onload = () => {
    //     document.body.style.backgroundImage = `url(${randomImage})`;
    //     resolve();
    //   };
    // });
 
    // const delayPromise = new Promise(resolve => setTimeout(resolve, 100));
    // // wait to laod background + 1 second
    // await Promise.all([imageLoadPromise, delayPromise]);
    hideSpinner();

  }
  
  // Location by IP
  async function getUserLocationByIP() {
    try {
      const res = await fetch('/location');
      const data = await res.json();

      return {
        city: data.city,
        lat: data.lat,
        lon: data.lon
      };
    } catch (err) {
      console.error('Failed to get location:', err);
      return {
        city: 'Unknown',
        lat: 0,
        lon: 0
      };
    }
  }


  // Current Location
  async function useCurrentLocation() {
    showSpinner();
    document.getElementById('cityInput').value = '';
    navigator.geolocation.getCurrentPosition(async (pos) => {
      const lat = pos.coords.latitude;
      const lon = pos.coords.longitude;
      const weatherData = await getWeatherData(lat, lon);
      isCurrentLocation = true;
      updateCurrentWeather(weatherData);
      updateForecast(weatherData);
    }, (err) => {
      alert("Location access denied or unavailable.");
      hideSpinner();
    });
  }


  // Search City
  async function searchCity() {
    isCurrentLocation = false;
    const city = document.getElementById('cityInput').value.trim();
    document.getElementById('cityInput').value = '';

    if (!city) return alert('Enter a city name!');

    showSpinner(); 
    try {
      const res = await fetch(`/search?q=${city}`);
      const data = await res.json();

      if (data.length === 0) {
        alert('City not found!');
        hideSpinner();
        return;
      }
      const lat = data[0].lat;
      const lon = data[0].lon;
      const weatherData = await getWeatherData(lat, lon);

      updateCurrentWeather(weatherData);
      updateForecast(weatherData);
    } catch (err) {
      alert("An error occurred while fetching weather.");
      hideSpinner();
      console.error(err);
    } 
  }


  // Weather
  async function getWeatherData(lat, lon) {
    const res = await fetch(`/getweather?lat=${lat}&lon=${lon}`);
    return await res.json();
  }

  // Update Weather
  function updateCurrentWeather(data) {
    const timezoneOffset = data.city.timezone; 

    const weather = data.list[0].weather[0];
    const iconFile = getWeatherIcon(weather.main, weather.icon);

    const windSpeed = data.list[0].wind.speed;
    const rain = data.list[0].rain?.['3h'] ?? 0;
    const windKmH = (windSpeed * 3.6).toFixed(1); 

    const nowUTC = new Date(new Date().getTime() + new Date().getTimezoneOffset() * 60000);
    const localTime = new Date(nowUTC.getTime() + timezoneOffset * 1000);
    const dateStr = localTime.toLocaleDateString('en-GB');
    const timeStr = localTime.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });
    setBackgroundByTimeAndDevice(localTime.getHours());

    document.querySelector('.date1').textContent = `${localTime.toLocaleDateString('en-US', { weekday: 'long' })}, ${timeStr}`;
    document.querySelector('.date2').textContent = dateStr;
    document.querySelector('.temp .value').textContent = `${Math.round(data.list[0].main.temp)}°C`;
    document.querySelector('.temp .city').textContent = isCurrentLocation ? `📍 ${data.city.name}` : data.city.name;
    document.getElementById('weather-icon').src = `Images/Icons/${iconFile}`;

    document.getElementById('water-icon').src = '/Images/Icons/water.svg';
    document.getElementById('winds-icon').src = '/Images/Icons/winds.svg';
    document.getElementById('weather-icon').style.visibility = 'visible';

    document.getElementById('rain-amount').textContent = `${rain} mm`;
    document.getElementById('wind-speed').textContent = `${windKmH} km/h`;
  }

  // Weather Icon
  function getWeatherIcon(main, iconCode) {
    const isNight = iconCode.includes('n');
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


  function updateForecast(data) {
    const dayElements = document.querySelectorAll('.day');
    let shownDays = 0;
    const timezoneOffset = data.city.timezone;

    for (let i = 0; i < data.list.length; i++) {
      const item = data.list[i];
      const weather = item.weather[0];
      const iconFile = getWeatherIcon(weather.main, weather.icon);

      const windSpeed = item.wind.speed;
      const rain = item.rain?.['3h'] ?? 0;
      const windKmH = (windSpeed * 3.6).toFixed(1);

      if (item.dt_txt.includes("12:00:00")) {
        const utc = new Date(item.dt * 1000);
        const localTime = new Date(utc.getTime() + timezoneOffset * 1000);

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



  // Initial
  async function init() {
    showSpinner();
    try {
      isCurrentLocation = false;
      const location = await getUserLocationByIP();
      const weatherData = await getWeatherData(location.lat, location.lon);
      updateCurrentWeather(weatherData);
      updateForecast(weatherData);
      // showWarningBox();
    } catch (error) {
      console.error('Error fetching weather data:', error);
    }
  }

  init();