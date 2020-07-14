const axios = require('axios');
const settings = require('../system/settings');
const secrets = require('/home/pi/alarm.secrets.json');

async function request() {
  const { latitude, longitude } = settings.get().weather;
  const { apiKey } = secrets.weather;
  const response = await axios.get(`https://api.openweathermap.org/data/2.5/onecall?lat=${latitude}&lon=${longitude}&appid=${apiKey}&exclude=minutely&units=imperial`);
  return response;
}

async function getForecast() {
  const response = await request();

  const now = new Date();
  const day = response.data.daily.find(d => {
    return new Date(d.dt * 1000).getDate() === now.getDate()
  });

  const conditions = day.snow > 0 ? 'Snow' : day.rain > 0.5 ? 'Rain' : 'Clear';
  const high = day.temp.max;
  const low = day.temp.min;

  return {
    conditions,
    high,
    low,
  };
}

module.exports = {
  getForecast
};
