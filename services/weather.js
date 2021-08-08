const axios = require('axios');
const settings = require('../system/settings');
const secrets = require('/home/pi/alarm.secrets.json');

async function request() {
  const { latitude, longitude } = settings.get().weather;
  const { apiKey } = secrets.weather;
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&exclude=minutely&units=imperial`);
  return response;
}

function parseCondition(id) {
  if (id.startsWith('2')) {
    return 'stormy';
  } else if (id.startsWith('3' || id.startsWith('4'))) {
    return 'rainy';
  } else if (id.startsWith('4')) {
    return snowy;
  } else if (id.startsWith('8') && id !== '800') {
    return 'cloudy';
  } else {
    return 'sunny';
  }
}

async function getForecast() {
  const response = await request();

  const now = new Date();
  const day = response.data.daily.find(d => {
    return new Date(d.dt * 1000).getDate() === now.getDate()
  });

  console.log(day.weather);
  const weather = day.weather[0];

  const conditions = parseCondition(weather.id.toString());
  const high = Math.ceil(day.temp.max);
  const low = Math.floor(day.temp.min);

  return {
    conditions,
    high,
    low,
  };
}

module.exports = {
  getForecast
};
