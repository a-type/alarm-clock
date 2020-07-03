const axios = require('axios');
const FormData = require('form-data');
const secrets = require('/home/pi/alarm.secrets.json');
const SettingsStorage = require('../system/SettingsStorage');

const spotifyStorage = new SettingsStorage('/home/pi/alarm.spotifystore.json', {
  refreshToken: null,
});

async function getToken(code) {
  const formData = new FormData();
  formData.append('grant_type', 'authorization_code');
  formData.append('code', code);
  formData.append('redirect_uri', 'http://raspberrypi.local/spotifyRedirect');
  const response = await axios.post(
    'https://accounts.spotify.com/api/token',
    formData,
    {
      headers: formData.getHeaders(),
      authorization: `Basic ${Buffer.from(
        `${secrets.spotify.clientId}:${secrets.spotify.clientSecret}`,
        'utf-8',
      ).toString('base64')}`,
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
  const { accessToken } = refresh();

  let response = await axios.request({
    url,
    method,
    data: body,
    baseUrl: 'https://api.spotify.com/v1/',
    headers: {
      authorization: `Bearer ${accessToken}`,
    },
  });

  if (response.status === 403 || response.status === 401) {
    // try once more
    const { accessToken: newAccessToken } = refresh(true);

    response = await axios.request({
      url,
      method,
      data: body,
      baseUrl: 'https://api.spotify.com/v1/',
      headers: {
        authorization: `Bearer ${accessToken}`,
      },
    });
  }

  if (response.status >= 300) {
    throw new Error(
      'Spotify request failed',
      response.status,
      JSON.stringify(response.body),
    );
  }

  return response;
}

async function getUser() {
  const response = await request('me');
  return response.body;
}

async function listPlaylists() {
  const user = await getUser();
  const response = await request(`users/${user.id}/playlists`);
  return response.body.items;
}

async function listDevices() {
  const response = await request(`me/player/devices`);
  return response.body.devices;
}

module.exports = {
  getToken,
  getUser,
  listPlaylists,
  listDevices,
};
