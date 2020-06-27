const fs = require('fs');
const { EventEmitter } = require('events');

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
    hours: 0,
    minutes: 0,
  }
}

function saveSettings(settings) {
  fs.writeFileSync('settings.json', JSON.stringify(settings), { encoding: 'utf-8' });
}

function loadSettings() {
  if (fs.existsSync('settings.json')) {
    return fs.readFileSync('settings.json', 'utf-8');
  }
  return DEFAULT_SETTINGS;
}

class Settings extends EventEmitter {
  constructor() {
    super();

    ['set', 'get'].forEach(m => this[m] = this[m].bind(this));

    if (fs.existsSync('settings.json')) {
      const stringSettings = fs.readFileSync('settings.json', 'utf-8');
      try {
        this.settings = JSON.parse(stringSettings);
      } catch (err) {
        console.error(err);
        this.settings = DEFAULT_SETTINGS;
      }
    } else {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  set(settings) {
    fs.writeFileSync('settings.json', JSON.stringify(settings), { encoding: 'utf-8' });
    this.settings = settings;
    this.emit('changed', this.settings);
  }

  get() {
    return this.settings;
  }
}

module.exports = new Settings();
