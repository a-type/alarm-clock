const fs = require('fs');
const { EventEmitter } = require('events');

const MAIN_SETTINGS_FILE = '/home/pi/alarm.settings.json';

const DEFAULT_SETTINGS = {
  alarms: {
    sunday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    monday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    tuesday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    wednesday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    thursday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    friday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
    saturday: {
      hour: null,
      minute: null,
      playlistId: null,
    },
  },
  timeAdjustment: {
    hour: 0,
    minute: 0,
  },
};

module.exports = new SettingsStorage(MAIN_SETTINGS_FILE, DEFAULT_SETTINGS);
