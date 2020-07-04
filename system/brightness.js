const { EventEmitter } = require('events');
const clock = require('./clock');

function isEvening(dateTime) {
  return dateTime.getHours() > 19 || dateTime.getHours() < 7;
}

class Brightness extends EventEmitter {
  constructor() {
    super();

    this.currentState = 0;

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
    const desiredState = isEvening(now) ? 0.5 : 1;
    if (desiredState !== this.currentState) {
      this.currentState = desiredState;
      this.emit('changed', desiredState);
    }
  }
}

module.exports = new Brightness();
