const rpio = require('rpio');

const PINS = [0, 5, 6];

const lastVals = [0, 0, 0];
PINS.forEach((pin, idx) => {
  // rpio.open(pin, rpio.OUTPUT);
  rpio.open(pin, rpio.INPUT);
})

setInterval(() => {
  PINS.forEach((pin, idx) => {
    const val = rpio.read(pin);
    if (val !== lastVals[idx]) {
      console.log(`PIN: ${pin} VAL: ${val}`);
      lastVals[idx] = val;
    }
  });
}, 0);


// setInterval(() => {
//   PINS.forEach((pin, idx) => {
//     rpio.write(pin, lastVals[idx]);
//     lastVals[idx] = lastVals[idx] === 0 ? 1 : 0;
//   });
// }, 2000);
