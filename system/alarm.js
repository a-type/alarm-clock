const { EventEmitter } = require('events');
const settings = require('./settings');
const clock = require('./clock');
const { DAYS_IN_ORDER } = require('./constants');

class Alarm extends EventEmitter {
  constructor() {
    super();

    ['handleMinuteChanged', 'start', 'stop'].forEach(
      (m) => (this[m] = this[m].bind(this)),
    );

    this.start();
  }

  start() {
    clock.on('minuteChanged', this.handleMinuteChanged);
  }

  stop() {
    clock.off('minuteChanged', this.handleMinuteChanged);
  }

  handleMinuteChanged(now) {
    const { alarms } = settings.get();
    const today = DAYS_IN_ORDER[now.getDay()];
    const alarm = alarms[today];
    if (!alarm || !alarm.hour || !alarm.minute) return;

    const isAlarmMinute =
      alarm.hour === now.getHours() && alarm.minute === now.getMinutes();

    if (isAlarmMinute) {
      this.emit('triggered');
    }
  }
}

module.exports = new Alarm();
