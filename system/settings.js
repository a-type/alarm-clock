const SettingsStorage = require('./SettingsStorage');

const MAIN_SETTINGS_FILE = '/home/pi/alarm.settings.json';

const DEFAULT_SETTINGS = {
  alarms: {
    sunday: null,
    monday: null,
    tuesday: null,
    wednesday: null,
    thursday: null,
    friday: null,
    saturday: null,
  },
  timeAdjustment: {
    hour: 0,
    minute: 0,
  },
};

module.exports = new SettingsStorage(MAIN_SETTINGS_FILE, DEFAULT_SETTINGS);
