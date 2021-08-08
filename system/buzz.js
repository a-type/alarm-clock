const rpio = require('rpio');

class Buzz {
  constructor(pin = 12) {
    this.pin = pin;
    this.playDurationTimeout = null;
    this.playing = false;
    rpio.open(this.pin, rpio.OUTPUT, rpio.LOW);
    console.log('setup of buzz complete');
  }

  async start(pulseLength = 1000, duration = 60 * 1000) {
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
    rpio.write(this.pin, rpio.LOW);
    if (this.playDurationTimeout) clearTimeout(this.playDurationTimeout);
  }

  async pulse(duration) {
    rpio.write(this.pin, rpio.HIGH);
    await new Promise(resolve => setTimeout(resolve, duration));
    rpio.write(this.pin, rpio.LOW);
    await new Promise(resolve => setTimeout(resolve, duration));
  }
}

module.exports = new Buzz();
