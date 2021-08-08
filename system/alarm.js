const { EventEmitter } = require('events');
const settings = require('./settings');
const clock = require('./clock');
const { DAYS_IN_ORDER } = require('./constants');
const spotify = require('../services/spotify');
const mp3 = require('./mp3');

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
    if (!this.stopAlarm) {
      return;
    }
    this.stopAlarm();
  }

  async handleMinuteChanged(now) {
    const { alarms, spotify: spotifySettings } = settings.get();
    const today = DAYS_IN_ORDER[now.getDay()];
    const alarm = alarms[today];
    if (!alarm || !alarm.hour || !alarm.minute || alarm.disabled) return;

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

      // start playing Spotify
      try {
        let volume = 5;
        await spotify.shufflePlaylist(
          spotifySettings.deviceId,
          alarm.playlistUri,
          volume,
        );

        // slowly increase volume.
        let volumeIntervalHandle = setInterval(async () => {
          volume += 5;
          await spotify.setVolume(spotifySettings.deviceId, volume);
          if (volume > 100) clearInterval(volumeIntervalHandle);
        }, 5000);

        this.stopAlarm = async () => {
          try {
            await spotify.stopPlayback();
          } catch (err) {
            console.error("Awkward, couldn't stop Spotify. Trying again...");
            setTimeout(() => spotify.stopPlayback(), 1000);
          } finally {
            this.stopAlarm = null;
            clearInterval(volumeIntervalHandle);
          }
        };
      } catch (err) {
        console.error(err);
        console.error('Could not play alarm music!');

        // we expect there to be a /home/pi/default_alarm.mp3 to play as a backup...
        console.log('Playing backup alarm song...');
        const killPlay = mp3.play('/home/pi/default_alarm.mp3');
        console.log('Backup song should be playing.');
        this.stopAlarm = () => {
          killPlay();
          this.stopAlarm = null;
        };
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
