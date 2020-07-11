const SettingsStorage = require('./SettingsStorage');

const MAIN_SETTINGS_FILE = '/home/pi/alarm.settings.json';

const DEFAULT_SETTINGS = {
  alarms: {
    sunday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    monday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    tuesday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    wednesday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    thursday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    friday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
    saturday: {
      hour: null,
      minute: null,
      playlistUri: null,
      disabled: true,
    },
  },
  timeAdjustment: {
    hour: 0,
    minute: 0,
  },
  spotify: {
    deviceId: null,
  },
  hue: {
    lightGroupId: null,
  },
  weather: {
    // Raleigh, NC
    latitude: 35.779591,
    longitude: -78.638176,
  }
};

module.exports = new SettingsStorage(MAIN_SETTINGS_FILE, DEFAULT_SETTINGS);
