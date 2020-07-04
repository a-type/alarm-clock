const os = require('os');

const DEFAULT_IP = '192.168.86.195';

let ip = DEFAULT_IP;

const netInterfaces = os.networkInterfaces();

const wlan = netInterfaces.wlan0;

if (!wlan) {
  console.warn('No wlan0 network interface detected, falling back to default IP', DEFAULT_IP);
} else {
  const interface = wlan.find(i => i.family === 'IPv4');
  if (!interface) {
    console.warn('No IPv4 address for wlan0 found, falling back to default IP', DEFAULT_IP);
  } else {
    ip = interface.address;
  }
}

module.exports = ip;
