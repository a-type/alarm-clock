const axios = require('axios');
const FormData = require('form-data');
const secrets = require('/home/pi/alarm.secrets.json');
const SettingsStorage = require('../system/SettingsStorage');
const ip = require('../system/ip');

const spotifyStorage = new SettingsStorage('/home/pi/alarm.spotifystore.json', {
  refreshToken: null,
  accessToken: null,
});

async function getToken(code, refresh = false) {
  const formData = refresh
    ? `grant_type=refresh_token&refresh_token=${encodeURIComponent(code)}`
    : `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent(`http://${ip}/spotifyRedirect`)}`;
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    formData,
    {
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
        accept: 'application/json',
        authorization: `Basic ${Buffer.from(
          `${secrets.spotify.clientId}:${secrets.spotify.clientSecret}`,
          'utf-8',
        ).toString('base64')}`,
      },
      validateStatus: status => status < 500,
    },
  );

  if (response.status >= 300) {
    console.error(`Spotify token auth failed: ${response.status}, ${JSON.stringify(response.data)}`);
    console.error(`Sent: ${formData}`);
    throw new Error(
      'Spotify authorization failed'
    );
  }

  const body = response.data;

  spotifyStorage.set({
    accessToken: body.access_token,
    // there's only 1 persistent refresh token, so put it back into
    // the settings storage when we do a refresh
    refreshToken: refresh ? code : body.refresh_token,
  });

  return body.access_token;
}

async function refresh() {
  const { refreshToken } = spotifyStorage.get();
  const newToken = await getToken(refreshToken, true);
  return newToken;
}

async function request(url, method = 'GET', body = undefined) {
  // const { accessToken } = spotifyStorage.get();
  const accessToken = await refresh();

  let response = await axios.request({
    url,
    method,
    data: body,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
    validateStatus: status => status < 500,
  });

  if (response.status === 403 || response.status === 401) {
    // try once more
    const newAccessToken = await refresh();

    response = await axios.request({
      url,
      method,
      data: body,
      headers: {
        authorization: `Bearer ${newAccessToken}`,
      },
      validateStatus: status => status < 500,
    });
  }

  if (response.status >= 300) {
    console.error(`Spotify request failed: ${url}, ${response.status}, ${JSON.stringify(response.data)}`);
    const err = new Error(
      'Spotify request failed',
    );
    err.response = response;
    throw err;
  }

  return response;
}

async function getUser() {
  const response = await request('https://api.spotify.com/v1/me');
  return response.data;
}

async function listPlaylists() {
  const response = await request(`https://api.spotify.com/v1/me/playlists`);
  return response.data.items;
}

async function listDevices() {
  const response = await request(`https://api.spotify.com/v1/me/player/devices`);
  return response.data.devices;
}

async function transferPlayback(deviceId) {
  await request(`https://api.spotify.com/v1/me/player`, 'PUT', {
    device_ids: [deviceId],
  });
}

async function startPlayback(deviceId, playlistUri) {
  await request(`https://api.spotify.com/v1/me/player/play?deviceId=${deviceId}`, 'PUT', playlistUri ? {
    context_uri: playlistUri
  } : {});
}

async function stopPlayback() {
  await request(`https://api.spotify.com/v1/me/player/pause`, 'PUT', {});
}

async function setVolume(deviceId, volumePercent) {
  await request(`https://api.spotify.com/v1/me/player/volume?device_id=${deviceId}&volume_percent=${volumePercent}`, 'PUT');
}

async function setShuffle(deviceId, shuffle) {
  await request(`https://api.spotify.com/v1/me/player/shuffle?device_id=${deviceId}&state=${shuffle}`, 'PUT');
}

async function skipNext(deviceId) {
  await request(`https://api.spotify.com/v1/me/player/next?device_id=${deviceId}`, 'POST');
}

async function shufflePlaylist(deviceId, playlistUri, volumePercent) {
  await transferPlayback(deviceId);
  await setVolume(deviceId, volumePercent);
  await startPlayback(deviceId, playlistUri);
  await stopPlayback();
  await setShuffle(deviceId, true);
  await skipNext(deviceId);
  await startPlayback(deviceId);
}

module.exports = {
  getToken,
  getUser,
  listPlaylists,
  listDevices,
  startPlayback,
  setVolume,
  stopPlayback,
  transferPlayback,
  setShuffle,
  shufflePlaylist,
};
