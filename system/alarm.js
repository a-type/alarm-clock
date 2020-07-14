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
    if (!this.stopAlarm) {
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
        let volume = 5;
        await spotify.shufflePlaylist(spotifySettings.deviceId, alarm.playlistUri, volume);

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
            console.error('Awkward, couldn\'t stop Spotify. Trying again...');
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
