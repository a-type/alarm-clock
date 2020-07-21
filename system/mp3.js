// this file is for mp3 playback - ideally music is played via Spotify Connect,
// but these utilities power the fallback alarm.
const proc = require('child_process');

let lastProcess;

/**
 * Plays an MP3 file using mpv. mpv must be installed. Returns a function
 * you can call to stop playback (kills process)
 */
function playMp3(pathToFile) {
  lastProcess = proc.exec(`mpv ${pathToFile}`, (error, stdout, stderr) => {
    if (error) {
      console.error(error);
    }
    console.log('Playing Mp3: ' + pathToFile);
  });
  return () => {
    try {
      lastProcess.kill();
    } catch (err) {
      console.error(err);
    }
  };
}

function stop() {
  if (lastProcess) {
    try {
      lastProcess.kill();
    } catch (err) {
      console.error(err);
    }
  }
}

module.exports = {
  play: playMp3,
  stop,
};
