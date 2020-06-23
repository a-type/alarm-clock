const HT1632C = require('./HT1632C');

const driver = new HT1632C(9, 11, 10);

driver.selfTest();

for (let i = 0; i < 99; i++) {
  for (let j = 0; j < 64; j+=2) {
    driver.writeDataByte(j, Math.floor(Math.random() * 0xff));
  }
}

driver.clearScreen();
