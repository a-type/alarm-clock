const fs = require('fs');
const { EventEmitter } = require('events');

function recursiveDefault(values, defaults) {
  return Object.keys(defaults).reduce((final, key) => {
    if (Array.isArray(defaults[key])) {
      // TODO?
      final[key] = [];
    } else if (typeof defaults[key] === 'object' && defaults[key] !== null) {
      if (typeof values[key] !== 'object' || values[key] === null) {
        final[key] = defaults[key];
      } else {
        final[key] = recursiveDefault(values[key], defaults[key]);
      }
    } else {
      if (values.hasOwnProperty(key)) {
        final[key] = values[key];
      } else {
        final[key] = defaults[key];
      }
    }
    return final;
  }, {});
}

module.exports = class SettingsStorage extends EventEmitter {
  constructor(fileLocation, defaultValues = {}) {
    super();

    this.fileLocation = fileLocation;
    this.defaultValues = defaultValues;

    ['set', 'get'].forEach((m) => (this[m] = this[m].bind(this)));

    if (fs.existsSync(this.fileLocation)) {
      const stringSettings = fs.readFileSync(this.fileLocation, 'utf-8');
      try {
        this.settings = recursiveDefault(JSON.parse(stringSettings), this.defaultValues);
      } catch (err) {
        console.error(err);
        this.settings = this.defaultValues;
      }
    } else {
      this.settings = this.defaultValues;
    }
  }

  set(settings) {
    const defaulted = recursiveDefault(settings, this.defaultValues);
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
