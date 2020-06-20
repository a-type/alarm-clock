var wpi = require('node-wiring-pi');
var endian = require('./endian');

wpi.wiringPiSetupGpio();

console.log(process.env.WIRINGPI_GPIOMEM);

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

class HT1632C {
  constructor(options = {}) {
    this.pins = options.pins || {
      data: 10,
      wr: 11,
      clk: 8,
      cs: 7
    }
    this.numChips = 1;
    this.loopHandle = null;
    this.frameBuffer = new ArrayBuffer();
    this.spiFd = -1;

    ['selectChip', 'sendCommand', 'init', 'clear', 'write', 'sendFrame', 'update', 'start', 'stop']
      .forEach(method => {
        this[method] = this[method].bind(this);
      });
  }

  selectChip(chipIdx) {
    for (var i = 0; i < this.numChips; i++) {
      wpi.digitalWrite(this.pins.cs + i, 0);
    }
  }

  sendCommand(chipIdx, command) {
    var data = HT1632_ID_CMD;
    console.debug(`CMD: ${command.toString(2).padStart(16, '0').match(/..../g).join('-')}`)
    data <<= 8;
    data |= command;
    data <<= 5;
    var reversed = endian.reverseEndian(data);

    this.selectChip(chipIdx);
    this.write(reversed);
    this.selectChip(HT1632_CS_NONE);
  }

  init() {
    this.spiFd = wpi.wiringPiSPISetup(0, SPI_FREQ);
    if (!this.spiFd) {
      throw new Error('SPI setup failed: ' + wpi.errno);
    }

    for (var i = 0; i < this.numChips; i++) {
      wpi.pinMode(this.pins.cs + i, wpi.OUTPUT);
    }

    // this string of commands initializes the display
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_SYSOFF);
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_COMS00);
    // this.sendCommand(HT1632_CS_ALL, HT1632_CMD_LEADERMODE);
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_INTERNALCLOCK);
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_SYSON);
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_LEDON);
    // this.sendCommand(HT1632_CS_ALL, HT1632_CMD_BLINKOFF);
    // this.sendCommand(HT1632_CS_ALL, HT1632_CMD_PWM);
    this.sendCommand(HT1632_CS_ALL, HT1632_CMD_BLINKON);

    // this.clear();
    // this.sendFrame();
  }

  clear() {
    // TODO
  }

  write(data) {
    var buf = new Buffer([data]);
    wpi.wiringPiSPIDataRW(this.pins.cs, buf);
    return buf;
  }

  sendFrame() {
    for (var i; i < this.numChips; i++) {
      this.selectChip(i + 1);
      this.write(/** TODO */)
    }
  }

  update() {
    // TODO
    this.loopHandle = setTimeout(this.update, 0);
  }

  start() {
    this.update();
  }

  stop() {
    clearTimeout(this.loopHandle);
  }
}

// wpi.pinMode(pin, wpi.OUTPUT);

// var value = 1;

// setInterval(function() {
//   wpi.digitalWrite(pin, value);
//   value = +!value;
// }, 50);

var ht1632c = new HT1632C({
  pins: {
    data: 10,
    wr: 11,
    clk: 8,
    cs: 7
  }
});

ht1632c.init();
// ht1632c.start();
