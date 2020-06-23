var rpio = require('rpio');
var endian = require('./endian');

rpio.init({
  mapping: 'gpio'
})

const PIN_LIGHT = 17;
const PIN_DATA = 10;
const PIN_WR = 11;
const PIN_CLK = 8;
const PIN_CS = 7;

const PANEL_WIDTH = 24;
const PANEL_HEIGHT = 8;

const HT1632_ID_CMD = 4; // ID = 100 - Commands
const HT1632_ID_RD = 6;  // ID = 110 - Read RAM
const HT1632_ID_WR = 5;  // ID = 101 - Write RAM

const HT1632_CMD_SYSOFF = 0x00;        // 0000-0000-x : Oscillator OFF
const HT1632_CMD_SYSON = 0x01;         // 0000-0001-x : Oscillator ON
const HT1632_CMD_LEDOFF = 0x02;        // 0000-0010-x : LED ducy cycle gen off
const HT1632_CMD_LEDON = 0x03;         // 0000-0011-x : LEDs ON
const HT1632_CMD_BLINKOFF = 0x08;      // 0000-1000-x : Blink OFF
const HT1632_CMD_BLINKON = 0x09;       // 0000-1001-x : Blink ON
const HT1632_CMD_FOLLOWMODE = 0x10;    // 0001-00xx-x : Follow mode
const HT1632_CMD_LEADERMODE = 0x14;    // 0001-01xx-x : Leader mode
const HT1632_CMD_INTERNALCLOCK = 0x18; // 0001-10xx-x : Use internal clock
const HT1632_CMD_EXTERNALCLOCK = 0x1c; // 0001-11xx-x : Use external clock
const HT1632_CMD_COMS00 = 0x20;        // 0010-ABxx-x : commons options
const HT1632_CMD_COMS01 = 0x24;        // 0010-ABxx-x : commons options
const HT1632_CMD_COMS10 = 0x28;        // 0010-ABxx-x : commons options
const HT1632_CMD_COMS11 = 0x2C;        // 0010-ABxx-x : commons options
const HT1632_CMD_PWM = 0xa0;           // 101x-PPPP-x : PWM duty cycle

const HT1632_ID_LEN = 3; // IDs are 3 bits
const HT1632_CMD_LEN = 8; // CMDs are 8 bits
const HT1632_DATA_LEN = 8; // Data is 4 * 2 bits
const HT1632_ADDR_LEN = 7; // Addresses are 7 bits

const HT1632_CS_NONE = 0x00; // No chips selected
const HT1632_CS_ALL = 0xff; // All chips selected

const SPI_FREQ = 2560000;

[PIN_LIGHT, PIN_DATA, PIN_WR, PIN_CLK, PIN_CS]
  .forEach(pin => {
    rpio.open(pin, rpio.OUTPUT, rpio.LOW);
  });

function writeCmd(cmd) {
  cmd = cmd & 0x0fff;
  for (i = 0; i < 12; i++) {
    var j = cmd & 0x0800;
    cmd = cmd << 1;
    j = j >> 11;
    rpio.write(PIN_WR, 0);
    rpio.write(PIN_DATA, j);
    rpio.write(PIN_WR, 1);
  }
}

function doCmd(cmd) {
  rpio.write(PIN_CS, 0);
  rpio.write(PIN_CLK, 1);
  rpio.write(PIN_CLK, 0);
  writeCmd(cmd);
  rpio.write(PIN_CS, 1);
  rpio.write(PIN_CLK, 1);
  rpio.write(PIN_CLK, 0);
}

doCmd(HT1632_CMD_SYSOFF);
doCmd(HT1632_CMD_COMS00);
doCmd(HT1632_CMD_INTERNALCLOCK);
doCmd(HT1632_CMD_SYSON);
doCmd(HT1632_CMD_LEDON);
doCmd(HT1632_CMD_BLINKOFF);

doCmd(HT1632_CMD_BLINKON);

for (var i = 0; i < 2; i++) {
  rpio.write(17, rpio.HIGH);
  rpio.sleep(1);

  rpio.write(17, rpio.LOW);
  rpio.msleep(500);
}
