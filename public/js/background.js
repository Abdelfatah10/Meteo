import { hideSpinner } from "./uiHelpers.js";

// Background Image
export async function setBackgroundByTimeAndDevice(hour) {
    const isMobile = window.innerWidth <= 950;
    let timeOfDay;

    if (hour >= 6 && hour < 17) timeOfDay = 'day';
    else if (hour >= 17 && hour < 19) timeOfDay = 'sunset';
    else timeOfDay = 'night';

    const deviceType = isMobile ? 'mobile' : 'laptop';

    const imagePaths = {
      laptop: {
        day: [
          '/Images/laptop/day/1.webp',
          '/Images/laptop/day/2.webp',
          '/Images/laptop/day/3.webp',
          '/Images/laptop/day/4.webp',
          '/Images/laptop/day/5.webp',
          '/Images/laptop/day/6.webp'
        ],
        sunset: [
          '/Images/laptop/sunset/1.webp',
          '/Images/laptop/sunset/2.webp',
          '/Images/laptop/sunset/3.webp',
          '/Images/laptop/sunset/4.webp',
          '/Images/laptop/sunset/5.webp',
          '/Images/laptop/sunset/6.webp',
          '/Images/laptop/sunset/7.webp',
          '/Images/laptop/sunset/8.webp',
          '/Images/laptop/sunset/9.webp',
          '/Images/laptop/sunset/10.webp'

        ],
        night: [
          '/Images/laptop/night/1.webp',
          '/Images/laptop/night/2.webp',
          '/Images/laptop/night/3.webp',
          '/Images/laptop/night/4.webp',
          '/Images/laptop/night/5.webp',
          '/Images/laptop/night/6.webp',
          '/Images/laptop/night/7.webp',
          '/Images/laptop/night/8.webp',
          '/Images/laptop/night/9.webp'
        ]
      },
      mobile: {
        day: [
          '/Images/mobile/day/1.webp',
          '/Images/mobile/day/2.webp',
          '/Images/mobile/day/3.webp',
          '/Images/mobile/day/4.webp',
          '/Images/mobile/day/5.webp'
        ],
        sunset: [
          '/Images/mobile/sunset/1.webp',
          '/Images/mobile/sunset/2.webp',
          '/Images/mobile/sunset/3.webp'
        ],
        night: [
          '/Images/mobile/night/1.webp',
          '/Images/mobile/night/2.webp',
          '/Images/mobile/night/3.webp',
          '/Images/mobile/night/4.webp',
          '/Images/mobile/night/5.webp',
          '/Images/mobile/night/6.webp',
          '/Images/mobile/night/7.webp',
          '/Images/mobile/night/8.webp'
        ]
      }
    };

    const images = imagePaths[deviceType][timeOfDay];
    const randomImage = images[Math.floor(Math.random() * images.length)];

    const imageLoadPromise = new Promise((resolve) => {
      const img = new Image();
      img.src = randomImage;
      img.onload = () => {
        document.body.style.backgroundImage = `url(${randomImage})`;
        resolve();
      };
    });
 
    const delayPromise = new Promise(resolve => setTimeout(resolve, 100));
    // wait to laod background 
    await Promise.all([imageLoadPromise, delayPromise]);
    hideSpinner();

}