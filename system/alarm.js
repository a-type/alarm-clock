const { EventEmitter } = require('events');
const settings = require('./settings');
const clock = require('./clock');
const { DAYS_IN_ORDER } = require('./constants');
const spotify = require('../services/spotify');
const mp3 = require('./mp3');

class Alarm extends EventEmitter {
  constructor() {
    super();

    ['handleMinuteChanged', 'enable', 'disable', 'stop'].forEach(
      (m) => (this[m] = this[m].bind(this)),
    );

    this.stopAlarm = null;

    this.enable();
  }

  enable() {
    clock.on('minuteChanged', this.handleMinuteChanged);
  }

  disable() {
    clock.off('minuteChanged', this.handleMinuteChanged);
  }

  stop() {
    console.debug('Stopping alarm');
    if (!this.stopAlarm) {
      console.debug('Nothing to do');
      return;
    }
    this.stopAlarm();
  }

  async handleMinuteChanged(now) {
    const { alarms, spotify: spotifySettings } = settings.get();
    const today = DAYS_IN_ORDER[now.getDay()];
    const alarm = alarms[today];
    if (!alarm || !alarm.hour || !alarm.minute) return;

    const isAlarmMinute =
      alarm.hour === now.getHours() && alarm.minute === now.getMinutes();

    if (isAlarmMinute) {
      this.emit('triggered');

      // start playing Spotify
      try {
        await spotify.startPlayback(spotifySettings.deviceId, alarm.playlistUri);
        await spotify.setVolume(0);

        // slowly increase volume.
        let volume = 5;
        let volumeIntervalHandle = setInterval(async () => {
          await spotify.setVolume(volume);
          volume += 5;
          if (volume > 100) clearInterval(volumeIntervalHandle);
        }, 5000);

        this.stopAlarm = async () => {
          try {
            await spotify.stopPlayback();
            this.stopAlarm = null;
          } catch (err) {
            console.error('Awkward, couldn\'t stop Spotify. Trying again...');
            setTimeout(this.stopAlarm, 1000);
          } finally {
            clearInterval(volumeIntervalHandle);
          }
        };
      } catch (err) {
        console.error(err);
        console.error('Could not play alarm music!');

        // we expect there to be a /home/pi/default_alarm.mp3 to play as a backup...
        const killPlay = mp3.play('/home/pi/default_alarm.mp3');
        this.stopAlarm = () => {
          killPlay();
          this.stopAlarm = null;
        };
      }
    }
  }
}

module.exports = new Alarm();
