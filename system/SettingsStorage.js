const fs = require('fs');
const { EventEmitter } = require('events');

module.exports = class SettingsStorage extends EventEmitter {
  constructor(fileLocation, defaultValues = {}) {
    super();

    this.fileLocation = fileLocation;
    this.defaultValues = defaultValues;

    ['set', 'get'].forEach((m) => (this[m] = this[m].bind(this)));

    if (fs.existsSync(this.fileLocation)) {
      const stringSettings = fs.readFileSync(this.fileLocation, 'utf-8');
      try {
        this.settings = {
          ...this.defaultValues,
          ...JSON.parse(stringSettings),
        };
      } catch (err) {
        console.error(err);
        this.settings = this.defaultValues;
      }
    } else {
      this.settings = this.defaultValues;
    }
  }

  set(settings) {
    const defaulted = { ...this.defaultValues, ...settings };
    fs.writeFileSync(this.fileLocation, JSON.stringify(defaulted), {
      encoding: 'utf-8',
    });
    this.settings = defaulted;
    this.emit('changed', this.settings);
  }

  get() {
    return this.settings;
  }
};
