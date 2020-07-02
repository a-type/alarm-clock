const fs = require('fs');
const { EventEmitter } = require('events');

const SETTINGS_FILE = '/home/pi/alarm.settings.json';

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
  }
}

class Settings extends EventEmitter {
  constructor() {
    super();

    ['set', 'get'].forEach(m => this[m] = this[m].bind(this));

    if (fs.existsSync(SETTINGS_FILE)) {
      const stringSettings = fs.readFileSync(SETTINGS_FILE, 'utf-8');
      try {
        this.settings = {...DEFAULT_SETTINGS, ...JSON.parse(stringSettings) };
      } catch (err) {
        console.error(err);
        this.settings = DEFAULT_SETTINGS;
      }
    } else {
      this.settings = DEFAULT_SETTINGS;
    }
  }

  set(settings) {
    const defaulted = {...DEFAULT_SETTINGS, ...settings};
    fs.writeFileSync(SETTINGS_FILE, JSON.stringify(defaulted), { encoding: 'utf-8' });
    this.settings = defaulted;
    this.emit('changed', this.settings);
  }

  get() {
    return this.settings;
  }
}

module.exports = new Settings();
