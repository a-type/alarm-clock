// this file is for mp3 playback - ideally music is played via Spotify Connect,
// but these utilities power the fallback alarm.
const proc = require('child_process');

let lastProcess;

function stop() {
  if (lastProcess) {
    try {
      process.kill(-lastProcess.pid);
    } catch (err) {
      console.error(err);
    }
  }
}

/**
 * Plays an MP3 file using mpv. mpv must be installed. Returns a function
 * you can call to stop playback (kills process)
 */
function playMp3(pathToFile) {
  lastProcess = proc.spawn(
    `mpv`,
    ['-v', '--log-file=/home/pi/mpv.log', `${pathToFile}`],
    { detached: true, stdio: 'pipe' },
  );
  return stop;
}

module.exports = {
  play: playMp3,
  stop,
};
