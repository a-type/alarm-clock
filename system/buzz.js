const rpio = require('rpio');

class Buzz {
  playDurationTimeout = null;
  playing = false;

  constructor(private pin = 12) {
    rpio.open(this.pin, rpio.OUTPUT, rpio.HIGH);
  }

  async start(pulseLength = 1000, duration = 30 * 1000) {
    this.playing = true;
    this.playDurationTimeout = setTimeout(() => {
      this.playing = false;
    }, duration);
    do {
      await this.pulse(pulseLength);
    } while (this.playing);
  }

  stop() {
    this.playing = false;
    rpio.write(this.pin, rpio.HIGH);
    if (this.playDurationTimeout) clearTimeout(this.playDurationTimeout);
  }

  async pulse(duration) {
    rpio.write(this.pin, rpio.LOW);
    await new Promise(resolve => setTimeout(resolve, duration));
    rpio.write(this.pin, rpio.HIGH);
  }
}

module.exports = new Buzz();
