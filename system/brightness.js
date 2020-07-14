const { EventEmitter } = require('events');
const clock = require('./clock');
const settings = require('./settings');

function isEvening(dateTime) {
  return dateTime.getHours() > 19 || dateTime.getHours() < 7;
}

class Brightness extends EventEmitter {
  constructor() {
    super();

    this.currentState = settings.get().display.nightBrightness;

    ['handleMinuteChanged', 'start', 'stop'].forEach((m) => (this[m] = this[m].bind(this)));

    this.start();
  }

  start() {
    clock.on('minuteChanged', this.handleMinuteChanged);
  }

  stop() {
    clock.off('minuteChanged', this.handleMinuteChanged);
  }

  handleMinuteChanged(now) {
    const displaySettings = settings.get().display;
    const desiredState = isEvening(now)
      ? displaySettings.nightBrightness
      : displaySettings.dayBrightness;
    if (desiredState !== this.currentState) {
      this.currentState = desiredState;
      this.emit('changed', desiredState);
    }
  }
}

module.exports = new Brightness();
