const express = require('express');
const path = require('path');
const settings = require('./system/settings');

const secrets = require('/home/pi/alarm.secrets.json');
const spotify = require('./services/spotify');

const runDisplay = require('./system/runDisplay');

const app = express();

const port = 80;

app.use(express.json());

app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).send('Internal error');
});

app.use(express.static(path.join(__dirname, 'ui/build')));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'ui/build/index.html'));
});

app.get('/api/settings', (req, res) => {
  res.send(settings.get());
});

app.put('/api/settings', (req, res) => {
  // TODO: validation
  settings.set(req.body);
  res.status(200).json(req.body);
});

let grantNonce = Math.random().toString().slice(2, 100);

app.get('/spotifyLogin', (req, res) => {
  const scopes =
    'user-read-playback-state user-modify-playback-state playlist-read-private streaming';
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      secrets.spotify.clientId
    }&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
      'http://raspberrypi.local/spotifyRedirect',
    )}&state=${grantNonce}`,
  );
});

app.get('/spotifyRedirect', async (req, res) => {
  const { code, state, error } = req.query;
  if (state !== grantNonce) {
    return res.status(401).send('State was not accepted');
  }
  if (error) {
    return res.redirect('/?spotifyRejected=true');
  }

  await spotify.getToken(code);

  return res.redirect('/?spotifyConnected=true');
});

runDisplay();
console.log('Display initialized');

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`),
);
