# alarm-clock

## Device Setup

I'm using a Pi Zero W.

Setup SSH - https://desertbot.io/blog/headless-pi-zero-w-wifi-setup-windows

VS Code over SSH - https://github.com/SchoofsKelvin/vscode-sshfs

Installing Node - https://www.thepolyglotdeveloper.com/2018/03/install-nodejs-raspberry-pi-zero-w-nodesource/

```
> curl -o node-v10.9.0-linux-armv6l.tar.gz https://nodejs.org/dist/v10.9.0/node-v10.9.0-linux-armv6l.tar.gz

> tar -xzf node-v10.9.0-linux-armv6l.tar.gz

> sudo cp -r node-v10.9.0-linux-armv6l/* /usr/local
```

## Running the test program

Right now I have a basic program to test board control to the old Kello display board I ripped out of my previous alarm clock. But theoretically it will work for anything HT1632C-powered. Connect the wires from HT1632C to Raspberry PI:

* WR = GPIO 9
* DATA = GPIO 11
* CS = GPIO 10

Then run `node src/test.js`. The display should flash and show some random noise.
