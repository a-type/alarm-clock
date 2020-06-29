const { EventEmitter } = require('events');
const settings = require('./settings');

const TICK_RESOLUTION = 1000;

class Clock extends EventEmitter {
  constructor() {
    super();

    ['tick'].forEach(m => this[m] = this[m].bind(this));
    this.tick();
  }

  tick() {
    const now = new Date();
    const { timeAdjustment } = settings.get();
    now.setHours(now.getHours() + timeAdjustment.hour || 0);
    now.setMinutes(now.getMinutes() + timeAdjustment.minute || 0);

    const previousTime = this.time;
    this.time = now;

    this.emit('tick', this.time);

    if (!previousTime || previousTime.getMinutes() !== this.time.getMinutes()) {
      this.emit('minuteChanged', this.time);
    }
    if (!previousTime || previousTime.getHours() !== this.time.getHours()) {
      this.emit('hourChanged', this.time);
    }

    setTimeout(this.tick, TICK_RESOLUTION);
  };
}

module.exports = new Clock();
