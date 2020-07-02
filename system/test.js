const driver = require('./ledDriver');
const rpio = require('rpio');
const rotary = require('./rotary');
const marquee = require('./marquee');

driver.selfTest();
driver.clearScreen();

// for (let y = 0; y < 8; y++) {
//   for (let x = 0; x < 24; x++) {
//     driver.clearFrameBuffer();
//     driver.drawPoint(x, y, 1);
//     driver.flushFrameBuffer();
//     rpio.sleep(0.25);
//   }
// }

// for (let a = 1; a < 48; a+=2) {
//   console.log(`Col ${a}`);
//   // for (let i = 0; i <= 0xff; i++) {
//     driver.writeDataNibble(a, 0x0f);
//     rpio.sleep(1);
//   // }
// }
// for (let i = 0; i < 99; i++) {
//   for (let j = 0; j < 64; j+=2) {
//     driver.writeDataByte(j, Math.floor(Math.random() * 0xff));
//   }
// }

// function drawTime() {
//   const now = new Date();
//   const hour = (now.getHours() - 5 + 48) % 24;
//   const minute = now.getMinutes();
//   driver.clearScreen();
//   driver.drawString(`${hour.toString().padStart(2, ' ')}:${minute.toString().padStart(2, '0')}`, { x: 1, y: 0 });
//   driver.flushFrameBuffer();
// }
// drawTime();
// setInterval(drawTime, 60000);

marquee('Long text!!', driver, 2);
