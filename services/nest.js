const axios = require('axios');
const settings = require('../system/settings');
const secrets = require('/home/pi/alarm.secrets.json');

const { clientId, clientSecret, projectId, refreshToken, thermostatDeviceId } = settings.get().nest;

async function getToken() {
  const response = await axios.post({
    url: `https://www.googleapis.com/oauth2/v4/token?client_id=${clientId}&client_secret=${clientSecret}&refresh_token=${refreshToken}&grant_type=refresh_token`,
    headers: {
    }
  });

  if (response.status >= 300) {
    console.error(`Nest token auth failed: ${response.status}, ${JSON.stringify(response.data)}`);
    throw new Error(
      'Nest authorization failed'
    );
  }

  const body = response.data;

  return body.access_token;
}

async function request(url, method = 'GET', body = undefined) {
  const token = await getToken();
  let response = await axios.request({
    url,
    method,
    data: body,
    headers: {
      authorization: `Bearer ${token}`
    },
    validateStatus: status => status < 500
  });

  if (response.status === 403 || response.status === 401) {
    // try once more
    const newAccessToken = await getToken();

    response = await axios.request({
      url,
      method,
      data: body,
      headers: {
        authorization: `Bearer ${token}`
      },
      validateStatus: status => status < 500
    });
  }

  if (response.status >= 300) {
    console.error(`Nest request failed: ${url}, ${response.status}, ${JSON.stringify(response.data)}`);
    const err = new Error(
      'Nest request failed',
    );
    err.response = response;
    throw err;
  }

  return response;
}

function getSetpointTemps(setpoint, mode) {
  if (mode === 'HEAT') {
    return {
      heatTo: setpoint.heatCelsius,
      coolTo: undefined
    };
  } else if (mode === 'COOL') {
    return {
      heatTo: undefined,
      coolTo: setpoint.coolCelsius,
    }
  } else if (mode === 'HEATCOOL') {
    return {
      heatTo: setpoint.heatCelsius,
      coolTo: setpoint.coolCelsius
    }
  } else {
    return {
      heatTo: undefined,
      coolTo: undefined
    }
  }
}

async function getThemostatState() {
  const response = await request(`https://smartdevicemanagement.googleapis.com/v1/enterprises/${projectId}/devices/${thermostatDeviceId}`);
  const mode = response.data.traits['sdm.devices.traits.ThermostatMode'] || {};
  const setpoint = response.data.traits['sdm.devices.traits.ThermostatTemperatureSetpoint'] || {};

  const setPointTemp = getSetpointTemp(setpoint, mode.mode);

  return {
    // HEAT | COOL | HEATCOOL | OFF
    mode: mode.mode,
    ...getSetpointTemps(setpoint, mode.mode),
  };
}
