const rpio = require('rpio');
const { EventEmitter } = require('events');

const PINS = {
  CLK: 21, // A
  DT: 20, // B
  SW: 16 // BUTTON
}

class Rotary extends EventEmitter {
  constructor() {
    super();

    rpio.open(PINS.CLK, rpio.INPUT);
    rpio.open(PINS.DT, rpio.INPUT);
    rpio.open(PINS.SW, rpio.INPUT, rpio.PULL_UP);

    ['onRotaryChange', 'onButtonChange'].forEach(method => this[method] = this[method].bind(this));

    // read initial state
    this.previousClkValue = rpio.read(PINS.CLK);

    // begin polling CLK
    rpio.poll(PINS.CLK, this.onRotaryChange);
    rpio.poll(PINS.SW, this.onButtonChange, rpio.POLL_LOW);
  }

  onRotaryChange(pin) {
    const currentClkValue = rpio.read(pin);
    if (currentClkValue !== this.previousClkValue && currentClkValue === 1) {
      // if the DT state is different then encoder is rotating CW
      if (rpio.read(PINS.DT) !== currentClkValue) {
        console.log('Rotary increment')
        this.emit('increment');
      } else {
        console.log('Rotary decrement');
        this.emit('decrement');
      }
    }

    this.previousClkValue = currentClkValue;
  }

  onButtonChange(pin) {
    rpio.msleep(20);
    if (rpio.read(pin)) return;

    console.log('Button pressed');
    this.emit('button');
  }
}

module.exports = new Rotary();
