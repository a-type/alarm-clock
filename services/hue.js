const v3 = require('node-hue-api').v3;
const SettingsStorage = require('../system/SettingsStorage');
const ip = require('../system/ip');
const settings = require('../system/settings');

const appName = 'alarm-clock';
const deviceName = 'smart-alarm-clock';

const hueStorage = new SettingsStorage('/home/pi/alarm.huestore.json', {
  username: null,
  clientKey: null,
});

async function discoverBridge() {
  const discoveryResults = await v3.discovery.nupnpSearch();

  if (discoveryResults.length === 0) {
    console.error('Failed to find bridge');
    return null;
  } else {
    return discoveryResults[0].ipaddress;
  }
}

async function discoverAndCreateUser() {
  const ipAddress = await discoverBridge();

  const unauthenticatedApi = await v3.api.createLocal(ipAddress).connect();

  let createdUser;
  try {
    createdUser = await unauthenticatedApi.users.createUser(appName, deviceName);

    hueStorage.set({
      username: createdUser.username,
      clientKey: createdUser.clientKey,
    });

    const authenticatedApi = await v3.api.createLocal(ipAddress).connect(createdUser.username);

    const bridgeConfig = await authenticatedApi.configuration.getConfiguration();
    console.debug(`Connected to Hue Bridge: ${bridgeConfig.name} :: ${bridgeConfig.ipaddress}`);
  } catch (err) {
    if (err.getHueErrorType() === 101) {
      throw new Error('The Link button on the bridge was not pressed. Please press the link button and try again.');
    } else {
      throw new Error('Unexpected error connecting to Hue bridge');
    }
  }
}

async function getApi() {
  const ipAddress = await discoverBridge();
  const { username } = hueStorage.get();

  if (!username) {
    throw new Error('You haven\'t set up Hue yet');
  }

  const api = await v3.api.createLocal(ipAddress).connect(username);
  return api;
}

async function getGroups() {
  const api = await getApi();

  const groups = await api.groups.getAll();
  return groups.map(g => g.getJsonPayload());
}

async function setGroupState(on) {
  const { hue } = settings.get();
  if (!hue || !hue.lightGroupId) {
    throw new Error('You haven\'t set up Hue yet');
  }

  const api = await getApi();

  await api.groups.setGroupState(hue.lightGroupId, {
    on,
  });
}

async function getGroupState() {
  const { hue } = settings.get();
  if (!hue || !hue.lightGroupId) {
    throw new Error('You haven\'t set up Hue yet');
  }

  const api = await getApi();

  const result = await api.groups.getGroupState(hue.lightGroupId);
  console.log(JSON.stringify(result));
  return result;
}

async function toggleGroupState() {
  const current = await getGroupState();
  await setGroupState(!current.any_on);
}

async function getBridge() {
  const api = await getApi();

  const bridgeConfig = await api.configuration.getConfiguration();
  return bridgeConfig;
}

module.exports = {
  discoverAndCreateUser,
  setGroupState,
  getGroups,
  getBridge,
  getGroupState,
  toggleGroupState
};
