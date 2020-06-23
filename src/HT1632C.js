const rpio = require('rpio');
const { terminalFont } = require('./fonts');

rpio.init({
  mapping: 'gpio',
});

const COMMANDS = {
  SYS_DIS: 0x00,
  SYS_EN: 0x01,
  LED_OFF: 0x02,
  LED_ON: 0x03,
  BLINK_OFF: 0x08,
  BLINK_ON: 0x09,
  SLAVE_MODE: 0x10,
  RC_MASTER_MODE: 0x18,
  EXT_CLK_MASTER_MODE: 0x1C,
  COMMON_8NMOS: 0x20,
  PWM16: 0xAF,
}

const COMMAND = 0x8000;
const DATA = 0xa000;
const BOARD0 = 0x00;

class HT1632C {
  constructor(wrPin, dataPin, csPin) {
    this.pins = {
      wr: wrPin,
      data: dataPin,
      cs: csPin,
    };
    this.font = terminalFont;

    console.log(`Pin config: ${JSON.stringify(this.pins)}`);

    ['initDisplay', 'clearScreen', 'selfTest', 'swapBits', 'writeCommand', 'writeDataNibble', 'writeDataByte', 'writeWord', 'writeFontCharacter', 'displayString']
      .forEach(method => {
        this[method] = this[method].bind(this);
      });

    rpio.open(this.pins.wr, rpio.OUTPUT, rpio.HIGH);
    rpio.open(this.pins.data, rpio.OUTPUT, rpio.LOW);
    rpio.open(this.pins.cs, rpio.OUTPUT, rpio.HIGH);

    this.initDisplay();
  }

  initDisplay() {
    [COMMANDS.SYS_DIS, COMMANDS.COMMON_8NMOS, COMMANDS.SYS_EN, COMMANDS.LED_ON, COMMANDS.PWM16]
      .forEach(this.writeCommand);

    rpio.sleep(0.1);
  }

  clearScreen() {
    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0x00);
    }
  };

  selfTest() {
    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0xff);
    }

    rpio.sleep(0.1);

    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0x00);
    }
  }

  // http://stackoverflow.com/questions/11725343/implementing-a-bit-swap-hack-in-python
  swapBits(b) { return (b * 0x0202020202 & 0x010884422010) % 1023; }

  writeCommand(command) {
    const word = COMMAND | (command << 5);
    this.writeWord(word, 12);
  }

  writeDataNibble(address, dataNibble) {
    const word = DATA | ((address & 0x3f) << 6) | ((dataNibble & 0x0f) << 2);
    this.writeWord(word, 14);
  };

  writeDataByte(address, dataByte) {
    const word = (DATA << 2) | ((address & 0x3f) << 8) | (dataByte & 0xff);
    this.writeWord(word, 18);
  };

  writeWord(word, bitsToWrite) {
    rpio.write(this.pins.wr, rpio.HIGH); // pull wr high to start write
    rpio.write(this.pins.cs, rpio.LOW);  // pull cs low to start write

    let start;
    let stop;
    if (bitsToWrite === 18) {
      start = 17;
      stop = -1;
    } else if (bitsToWrite === 14) {
      start = 15;
      stop = 1;
    } else if (bitsToWrite === 12) {
      start = 15;
      stop = 3;
    } else {
      throw new Error('invalid word size: ' + bitsToWrite);
    }

    for (let i = start; i > stop; i--) { // reverse-endian
      const mask = Math.pow(2, i);
      const bit = ((word & mask) === mask) ? 1 : 0;
      rpio.write(this.pins.data, bit);
      rpio.write(this.pins.wr, rpio.LOW); // clock it in
      rpio.write(this.pins.wr, rpio.HIGH);
    }

    rpio.write(this.pins.cs, rpio.HIGH); // finish the cycle
  }

  writeFontCharacter(char, addressColumn) {
    let i = addressColumn;
    for (let j = 0; j < char.length; j++) {
      const b = char[j];
      this.writeDataByte(i, this.swapBits(b));
      i += 2;
    }

    // blank column for spacing
    this.writeDataByte(i, 0x00);
  }

  displayString(string, startCol) {
    let currentColumn = startCol * 2;
    for (let s = 0; s < string.length; s++) {
      const char = string[s];
      const ord = char.charCodeAt(0);
      const fontIndex = ord - 32;
      this.writeFontCharacter(this.font[fontIndex], currentColumn);
      currentColumn += 12; // based on width of chars
    }
  }
}

module.exports = HT1632C;
