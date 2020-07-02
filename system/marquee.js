// helper function to marquee text across the screen

function measureText(text, driver) {
  let len = 0;
  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const letter = driver.font[char];
    len += letter[0].length + 1;
  }
  return len;
}

/**
 * Returns a function to cancel the marquee
 */
module.exports = function marquee(text, driver, speed = 1) {
  const changeDelay = 1500 / speed;
  const moveDelay = 500 / speed;

  const textLength = measureText(text, driver);

  if (textLength <= driver.dimensions.width) {
    driver.clearFrameBuffer();
    driver.drawString(text);
    driver.flushFrameBuffer();

    // no-op
    return () => {};
  } else {
    let timeoutHandle;
    let x = 0;
    function reset() {
      x = 0;
      driver.clearFrameBuffer();
      driver.drawString(text, { x, y: 0});
      driver.flushFrameBuffer();
      timeoutHandle = setTimeout(move, changeDelay);
    }

    function move() {
      x -= 1;
      driver.clearFrameBuffer();
      driver.drawString(text, { x, y: 0});
      driver.flushFrameBuffer();
      if (x < -(textLength - driver.dimensions.width)) {
        timeoutHandle = setTimeout(reset, changeDelay);
      } else {
        timeoutHandle = setTimeout(move, moveDelay);
      }
    }

    reset();

    return () => clearTimeout(timeoutHandle);
  }
}
