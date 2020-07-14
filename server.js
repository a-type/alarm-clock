const express = require('express');
const path = require('path');
const settings = require('./system/settings');
const ip = require('./system/ip');

const secrets = require('/home/pi/alarm.secrets.json');
const spotify = require('./services/spotify');
const hue = require('./services/hue');
const weather = require('./services/weather');

weather.getForecast().then(d => console.log(JSON.stringify(d)));

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

app.get('/api/spotify/user', async (req, res) => {
  try {
    const user = await spotify.getUser();
    res.send({ user });
  } catch (err) {
    console.error(err.message);
    res.status(200).send({ user: null });
  }
});

app.get('/api/spotify/playlists', async (req, res) => {
  try {
    const playlists = await spotify.listPlaylists();
    res.send({ playlists });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ playlists: [], message: 'Spotify not connected' });
  }
});

app.get('/api/spotify/devices', async (req, res) => {
  try {
    const devices = await spotify.listDevices();
    res.send({ devices });
  } catch (err) {
    console.error(err.message);
    res.status(400).send({ devices: [], message: 'Spotify not connected' });
  }
});

app.post('/api/spotify/testPlayback', async (req, res) => {
  try {
    await spotify.shufflePlaylist(req.body.deviceId, req.body.playlistUri, 15);
    res.status(201).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Playback failed');
  }
});

app.post('/api/spotify/stopPlayback', async (req, res) => {
  try {
    await spotify.stopPlayback();
    res.status(201).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send('Couldn\'t stop playback');
  }
});

app.post('/api/hue/connect', async (req, res) => {
  try {
    await hue.discoverAndCreateUser();
    res.status(201).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.get('/api/hue/groups', async (req, res) => {
  try {
    const groups = await hue.getGroups();
    res.status(200).send(groups);
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.put('/api/hue/state', async (req, res) => {
  try {
    await hue.setGroupState(req.body.on);
    res.status(201).send();
  } catch (err) {
    console.error(err.message);
    res.status(500).send(err.message);
  }
});

app.get('/api/hue/bridge', async (req, res) => {
  try {
    const bridge = await hue.getBridge();
    res.status(200).send(bridge);
  } catch (err) {
    console.error(err.message);
    res.status(404).send(err.message);
  }
});

let grantNonce = Math.random().toString().slice(2, 100);

app.get('/spotifyLogin', (req, res) => {
  const scopes =
    'user-read-playback-state user-modify-playback-state playlist-read-private streaming';
  res.redirect(
    `https://accounts.spotify.com/authorize?response_type=code&client_id=${
      secrets.spotify.clientId
    }&scope=${encodeURIComponent(scopes)}&redirect_uri=${encodeURIComponent(
      `http://${ip}/spotifyRedirect`,
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

  try {
    await spotify.getToken(code);
  } catch (err) {
    console.error(err);
    return res.redirect('/?spotifyFailed=true');
  }

  return res.redirect('/?spotifyConnected=true');
});

runDisplay();
console.log('Display initialized');

app.listen(port, () =>
  console.log(`Server started on http://localhost:${port}`),
);
