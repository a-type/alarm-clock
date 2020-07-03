const axios = require('axios');
const FormData = require('form-data');
const secrets = require('/home/pi/alarm.secrets.json');
const SettingsStorage = require('../system/SettingsStorage');

const spotifyStorage = new SettingsStorage('/home/pi/alarm.spotifystore.json', {
  refreshToken: null,
});

async function getToken(code) {
  const formData = `grant_type=authorization_code&code=${encodeURIComponent(code)}&redirect_uri=${encodeURIComponent('http://raspberrypi.local/spotifyRedirect')}`;
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
    },
  );

  if (response.status >= 300) {
    throw new Error(
      'Spotify authorization failed',
      response.status,
      JSON.stringify(response.data),
    );
  }

  const body = response.data;

  const expireTime = new Date();
  expireTime.setSeconds(expireTime.getSeconds() + body.expires_in);

  spotifyStorage.set({
    accessToken: body.access_token,
    refreshToken: body.refresh_token,
    expiresAt: expireTime.toISOString(),
  });

  console.log(body);

  return body.access_token;
}

async function refresh(force = false) {
  const { accessToken, refreshToken, expiresAt } = spotifyStorage.get();

  // buffer of time for expiration = 10s
  if (!force && new Date(expiresAt).getTime() > new Date().getTime() + 10000) {
    return accessToken;
  }

  const newToken = await getToken(refreshToken);
  return newToken;
}

async function request(url, method = 'GET', body = undefined) {
  const accessToken = await refresh();

  let response = await axios.request({
    url,
    method,
    data: body,
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 403 || response.status === 401) {
    // try once more
    const newAccessToken = await refresh(true);

    response = await axios.request({
      url,
      method,
      data: body,
      headers: {
        authorization: `Bearer ${newAccessToken}`,
      },
    });
  }

  if (response.status >= 300) {
    const err = new Error(
      'Spotify request failed',
      response.status,
      JSON.stringify(response.data),
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
  const user = await getUser();
  const response = await request(`https://api.spotify.com/v1/users/${user.id}/playlists`);
  return response.data.items;
}

async function listDevices() {
  const response = await request(`https://api.spotify.com/v1/me/player/devices`);
  return response.data.devices;
}

module.exports = {
  getToken,
  getUser,
  listPlaylists,
  listDevices,
};
