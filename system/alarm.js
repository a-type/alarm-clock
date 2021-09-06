const { EventEmitter } = require('events');
const settings = require('./settings');
const clock = require('./clock');
const { DAYS_IN_ORDER } = require('./constants');
const buzz = require('./buzz');

class Alarm extends EventEmitter {
  constructor() {
    super();

    [
      'handleMinuteChanged',
      'enable',
      'disable',
      'stop',
      'getHasAlarmWithin24Hrs',
    ].forEach((m) => (this[m] = this[m].bind(this)));

    this.stopAlarm = null;
    this.skipNext = false;

    this.enable();
  }

  enable() {
    clock.on('minuteChanged', this.handleMinuteChanged);
  }

  disable() {
    clock.off('minuteChanged', this.handleMinuteChanged);
  }

  stop() {
    buzz.stop();
  }

  async handleMinuteChanged(now) {
    const { alarms, } = settings.get();
    const today = DAYS_IN_ORDER[now.getDay()];
    const alarm = alarms[today];
    console.debug('Current time', now.getHours(), ':', now.getMinutes());
    console.debug(`Next Alarm: ${alarm ? `${alarm.hour}:${alarm.minute}` : 'none today'}`);
    if (!alarm || alarm.hour === undefined || alarm.minute === undefined || alarm.disabled) return;

    const isAlarmMinute =
      alarm.hour === now.getHours() && alarm.minute === now.getMinutes();

    if (isAlarmMinute) {
      console.info(`Alarm time triggered: ${now.toTimeString()}`);
      if (this.skipNext) {
        console.info('Skipping alarm, resetting skip next');
        this.skipNext = false;
        return;
      }

      this.emit('triggered');
      console.info('Starting alarm sequence');

      // start the buzz alarm
      try {
        buzz.start();
      } catch (err) {
        console.error(err);
        console.error('Could not start buzzer!');
      }
    }
  }

  getHasAlarmWithin24Hrs() {
    const { alarms } = settings.get();
    const now = clock.time;
    const today = DAYS_IN_ORDER[now.getDay()];
    const tomorrow = DAYS_IN_ORDER[(now.getDay() + 1) % 7];
    const todayAlarm = alarms[today];
    const tomorrowAlarm = alarms[tomorrow];
    const nextAlarm =
      !todayAlarm.disabled &&
      now.getHours() < todayAlarm.hour &&
      now.getMinutes() < todayAlarm.minute
        ? todayAlarm
        : tomorrowAlarm;

    return !nextAlarm.disabled && !this.skipNext;
  }
}

module.exports = new Alarm();
