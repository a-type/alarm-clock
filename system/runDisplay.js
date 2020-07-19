const { Machine, interpret } = require('xstate');
const driver = require('./ledDriver');
const rotary = require('./rotary');
const settings = require('./settings');
const alarm = require('./alarm');
const clock = require('./clock');
const marquee = require('./marquee');
const hue = require('../services/hue');
const brightness = require('./brightness');
const weather = require('../services/weather');

/**
 * DISPLAY
 *
 * Display manages a state machine of different screens.
 * When a screen is activated it is given the current display state and
 * is in control of modifications. It is also given a reference
 * to the hardware display driver and can assume to have full control
 * of display content. Finally, it gets a callback to call when it is
 * ready to transition to a new state, which it should pass the new
 * state instance to after constructing it.
 */

const displayMachine = Machine({
  id: 'display',
  initial: 'clock',
  context: {
    driver,
    settings,
    alarm,
    clock,
    hue,
    weather,
  },
  states: {
    clock: {
      on: {
        MAIN_BUTTON: {
          target: 'clock',
          actions: 'quickAction'
        },
        DIAL_INCREMENT: 'menu',
        DIAL_DECREMENT: 'menu',
      },
      activities: ['drawClock']
    },
    menu: {
      initial: 'lights',
      states: {
        lights: {
          on: {
            MAIN_BUTTON: '#display.lightsSettings',
            DIAL_INCREMENT: 'nest',
            DIAL_DECREMENT: 'alarm'
          },
          activities: ['drawMenuLights']
        },
        nest: {
          on: {
            MAIN_BUTTON: '#display.nestSettings',
            DIAL_INCREMENT: 'alarm',
            DIAL_DECREMENT: 'lights'
          },
          activities: ['drawMenuNest']
        },
        alarm: {
          on: {
            MAIN_BUTTON: '#display.alarmSettings',
            DIAL_INCREMENT: 'lights',
            DIAL_DECREMENT: 'nest'
          },
          activities: ['drawMenuAlarm']
        }
      }
    },
    lightsSettings: {
      initial: 'on',
      states: {
        on: {
          on: {
            MAIN_BUTTON: {
              target: '#display.clock',
              actions: 'lightsOn',
            },
            DIAL_INCREMENT: 'off',
            DIAL_DECREMENT: 'off',
          },
          activities: ['drawLightsSettingsOn']
        },
        off: {
          on: {
            MAIN_BUTTON: {
              target: '#display.clock',
              actions: 'lightsOff',
            },
            DIAL_INCREMENT: 'on',
            DIAL_DECREMENT: 'on',
          },
          activities: ['drawLightsSettingsOff']
        }
      },
    },
    nestSettings: {
      on: {
        MAIN_BUTTON: 'menu'
      },
      activities: ['drawNestSettings']
    },
    alarmSettings: {
      initial: 'skipNext',
      states: {
        skipNext: {
          on: {
            MAIN_BUTTON: {
              target: 'skipNext',
              actions: 'toggleSkipNext',
            },
          },
          activities: ['drawAlarmSettingsSkipNext'],
        },
      }
    },
    alarmRinging: {
      on: {
        MAIN_BUTTON: {
          target: 'morningRoutine',
          actions: 'stopAlarm'
        },
        ALARM_TIMEOUT: {
          target: 'morningRoutine',
          actions: 'stopAlarm'
        }
      },
      activities: ['drawAlarmRinging']
    },
    morningRoutine: {
      initial: 'showWeather',
      states: {
        showWeather: {
          on: {
            MAIN_BUTTON: '#display.clock'
          },
          activities: ['drawShowWeather']
        }
      }
    }
  },
  on: {
    IDLE: {
      target: 'clock',
      cond: (_, __, meta) => {
        return !['clock', 'alarmRinging'].includes(meta.state.value);
      },
    },
    ALARM_TRIGGERED: {
      target: 'alarmRinging'
    }
  }
}, {
  actions: {
    clearScreen: (context) => {
      context.driver.clearScreen();
    },
    stopAlarm: (context) => {
      alarm.stop();
    },
    lightsOn: (context) => {
      hue.setGroupState(true);
    },
    lightsOff: (context) => {
      hue.setGroupState(false);
    },
    quickAction: (context) => {
      hue.toggleGroupState();
    },
    toggleSkipNext: (context) => {
      alarm.skipNext = !alarm.skipNext;
    },
  },
  activities: {
    drawClock: (context) => {
      function draw(now) {
        const hour = now.getHours();
        const minute = now.getMinutes();

        const startX = hour < 10 ? 5 : 1;

        context.driver.clearFrameBuffer();
        context.driver.drawString(
          `${hour.toString()}:${minute.toString().padStart(2, '0')}`,
          { x: startX, y: 0 }
        );

        // draw a dot for alarm
        context.driver.drawPoint(23, 7, context.alarm.getHasAlarmWithin24Hrs() ? 1 : 0);

        context.driver.flushFrameBuffer();
      }
      context.clock.on('tick', draw);

      // cancels updates on end
      return () => context.clock.off('tick', draw);
    },
    drawMenuLights: (context) => marquee('Lights', context.driver),
    drawMenuNest: (context) => marquee('Nest', context.driver),
    drawMenuAlarm: (context) => marquee('Alarm', context.driver),
    drawLightsSettingsOn: (context) => marquee('On', context.driver),
    drawLightsSettingsOff: (context) => marquee('Off', context.driver),
    drawNestSettings: (context) => marquee('TODO', context.driver),
    drawAlarmSettingsSkipNext: (context) => {
      const skipNext = context.alarm.skipNext;
      return marquee(skipNext ? 'Unskip next' : 'Skip next', context.driver);
    },
    drawAlarmRinging: (context) => marquee('Wake up!', context.driver),
    drawShowWeather: (context) => {
      let innerCancel = function() { /* no op */ };
      let cancel = function() { innerCancel() };
      context.weather.getForecast()
        .then(({ conditions, high, low }) => {
          const displayString = `${conditions}, ${high}/${low}`;
          innerCancel = marquee(displayString, context.driver);
        }).catch((err) => {
          console.error(err);
          innerCancel = marquee('Good morning', context.driver);
        });

      return cancel;
    },
  }
})

module.exports = () => {
  const service = interpret(displayMachine);

  // idle timeout event
  let idleTimeout = null;
  service.onTransition(state => {
    console.log('State: ' + JSON.stringify(state.value));

    if (idleTimeout) {
      clearTimeout(idleTimeout);
    }
    if (state.value === 'alarmRinging') {
      idleTimeout = setTimeout(() => {
        service.send('ALARM_TIMEOUT');
      }, 5 * 60 * 1000);
    } else if (state.value.morningRoutine) {
      idleTimeout = setTimeout(() => {
        service.send('IDLE');
      }, 30 * 1000)
    } else if (state.value !== 'clock') {
      idleTimeout = setTimeout(() => {
        service.send('IDLE');
      }, 5 * 1000);
    }
  });

  // input events
  rotary.on('button', () => {
    service.send('MAIN_BUTTON');
  });
  rotary.on('increment', () => {
    service.send('DIAL_INCREMENT');
  });
  rotary.on('decrement', () => {
    service.send('DIAL_DECREMENT');
  });

  // alarm event
  alarm.on('triggered', () => {
    service.send('ALARM_TRIGGERED');
  });

  brightness.on('changed', level => {
    driver.setBrightness(level);
  });

  service.start();

  return () => service.stop();
};
