const rpio = require('rpio');
const { terminalFont } = require('./fonts');

rpio.init({
  // sets the pin mapping to use GPIO numbers instead of board numbers
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
  COMMON_16NMOS: 0x24,
  PWM: [
    0xA0,
    0xA1,
    0xA2,
    0xA3,
    0xA4,
    0xA5,
    0xA6,
    0xA7,
    0xA8,
    0xA9,
    0xAA,
    0xAB,
    0xAC,
    0xAD,
    0xAE,
    0xAF,
  ]
}

const COMMAND = 0x8000;
const DATA = 0xa000;
const BOARD0 = 0x00;

const DIMENSIONS = {
  WIDTH: 24,
  HEIGHT: 8,
}

function getFrameBufferIndex(x, y) {
  if (x < 0 || y < 0 || x >= DIMENSIONS.WIDTH || y >= DIMENSIONS.HEIGHT) return -1;

  // this logic is crazy because the addressing is crazy
  let frameIndex = 0;
  // for each counted horizontal panel the x traverses, add 64
  frameIndex += 64 * Math.floor(x / 8);
  // add the remainder when dividing by 8
  frameIndex += (x % 8);
  // for each y, add 8
  frameIndex += 8 * y;

  return frameIndex;
}

class HT1632C {
  constructor(wrPin = 11, dataPin = 9, csPin = 10) {
    this.pins = {
      wr: wrPin,
      data: dataPin,
      cs: csPin,
    };
    this.font = terminalFont;
    this.frameBuffer = new Array(DIMENSIONS.WIDTH * DIMENSIONS.HEIGHT).fill(0);
    this.dimensions = {
      width: DIMENSIONS.WIDTH,
      height: DIMENSIONS.HEIGHT
    };

    ['initDisplay', 'clearScreen', 'selfTest', 'swapBits', 'writeCommand', 'writeDataNibble', 'writeDataByte', 'writeWord', 'drawChar', 'drawPoint', 'drawString', 'flushFrameBuffer', 'writeBit', 'clearFrameBuffer', 'setBrightness']
      .forEach(method => {
        if (!this[method]) return;
        this[method] = this[method].bind(this);
      });

    rpio.open(this.pins.wr, rpio.OUTPUT, rpio.HIGH);
    rpio.open(this.pins.data, rpio.OUTPUT, rpio.LOW);
    rpio.open(this.pins.cs, rpio.OUTPUT, rpio.HIGH);

    this.initDisplay();
  }

  initDisplay() {
    [COMMANDS.SYS_DIS, COMMANDS.COMMON_8NMOS, COMMANDS.SYS_EN, COMMANDS.LED_ON, COMMANDS.PWM[0]]
      .forEach(this.writeCommand);

    rpio.sleep(0.1);
  }

  clearScreen() {
    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0x00);
    }
  };

  clearFrameBuffer() {
    this.frameBuffer = new Array(DIMENSIONS.WIDTH * DIMENSIONS.HEIGHT).fill(0);
  }

  selfTest() {
    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0xff);
    }

    rpio.sleep(0.1);

    for (let i = 0; i < 64; i+=2) {
      this.writeDataByte(i, 0x00);
    }
  }

  // https://stackoverflow.com/a/7946195
  swapBits(v) {
    var s = v.toString(16); // translate to hex
    s = s.replace(/^(.(..)*)$/, '0$1'); // add leading 0 if needed
    var a = s.match(/../g); // split in groups of 2
    a.reverse(); // reverse the groups
    var s2 = a.join(''); // join back
    var v2 = parseInt(s2, 16); // reparse to decimal
    return v2;
  }

  writeCommand(command) {
    const word = COMMAND | (command << 5);
    this.writeWord(word, 12);
  }

  writeDataNibble(address, dataNibble) {
    const word = DATA | ((address & 0x3f) << 6) | ((dataNibble & 0x0f) << 2);
    console.log(word.toString(2));
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
      this.writeBit(bit);
    }

    rpio.write(this.pins.cs, rpio.HIGH); // finish the cycle
  }

  writeBit(bit) {
    rpio.write(this.pins.data, (!!bit && bit > 0) ? 1 : 0);
    rpio.write(this.pins.wr, rpio.LOW); // clock it in
    rpio.write(this.pins.wr, rpio.HIGH);
  }

  // a drawing primitive, translates the physical location to framebuffer location
  drawPoint(x, y, bit) {
    const frameIndex = getFrameBufferIndex(x, y);
    // don't draw invalid pixels
    if (!frameIndex) return;

    this.frameBuffer[frameIndex] = bit;
  }

  /**
   * Writes a character to the framebuffer at cursor position,
   * then returns the updated cursor position, which will move horizontally
   * to the far end of the character.
   */
  drawCharacter(char, cursor, font) {
    const finalFont = (font || terminalFont);
    let map = finalFont[char];
    if (!map) map = finalFont[' '];
    const charWidth = map[0].length;

    for (let y = 0; y < map.length; y++) {
      for (let x = 0; x < map[y].length; x++) {
        this.drawPoint(x + cursor.x, y + cursor.y, map[y][x]);
      }
    }

    return {
      x: cursor.x + charWidth,
      y: cursor.y,
    }
  }

  drawString(string, startCursor = { x: 0, y: 0 }) {
    let cursor = startCursor;

    for (let i = 0; i < string.length; i++) {
      cursor = this.drawCharacter(string[i], cursor);
      // add space between letters
      cursor.x += 1;
    }
  }

  /** flushes the current frame buffer to screen */
  flushFrameBuffer() {
    rpio.write(this.pins.wr, rpio.HIGH);
    rpio.write(this.pins.cs, rpio.LOW);

    // manually writing the DATA command id
    [1, 0, 1].forEach(this.writeBit);

    // manually writing 0 address
    [0, 0, 0, 0, 0, 0, 0].forEach(this.writeBit);

    for (let i = 0; i < this.frameBuffer.length; i++) {
      this.writeBit(this.frameBuffer[i]);
    }

    rpio.write(this.pins.cs, rpio.HIGH);
  }

  /** level is 0 - 15 */
  setBrightness(level) {
    this.writeCommand(COMMANDS.PWM[level]);
  }
}

module.exports = new HT1632C();
