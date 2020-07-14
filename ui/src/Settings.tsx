import * as React from 'react';
import { makeStyles, Theme, Box, TextField, MenuItem } from '@material-ui/core';

export type SettingsProps = {
  timeAdjustment: { hour: number; minute: number };
  onTimeAdjustmentChanged: (newValue: { hour: number; minute: number }) => void;
  display: { dayBrightness: number; nightBrightness: number };
  onDisplayChanged: (newValue: {
    dayBrightness: number;
    nightBrightness: number;
  }) => void;
};

const useStyles = makeStyles<Theme, SettingsProps>(() => ({}));

const timeZones = [
  -11,
  -10,
  -9,
  -8,
  -7,
  -6,
  -5,
  -4,
  -3,
  -2,
  -1,
  0,
  1,
  2,
  3,
  4,
  5,
  6,
  7,
  8,
  9,
  10,
  11,
  12,
  13,
  14,
];

export function Settings(props: SettingsProps) {
  const {
    timeAdjustment,
    onTimeAdjustmentChanged,
    display,
    onDisplayChanged,
  } = props;

  const changeTimeZone = (ev: React.ChangeEvent<any>) => {
    const intVal = parseInt(ev.target.value);
    if (isNaN(intVal)) return;

    onTimeAdjustmentChanged({
      ...timeAdjustment,
      hour: intVal,
    });
  };

  const changeDayBrightness = (ev: React.ChangeEvent<any>) => {
    const intVal = parseInt(ev.target.value);
    if (isNaN(intVal)) return;

    onDisplayChanged({
      ...display,
      dayBrightness: intVal,
    });
  };

  const changeNightBrightness = (ev: React.ChangeEvent<any>) => {
    const intVal = parseInt(ev.target.value);
    if (isNaN(intVal)) return;

    onDisplayChanged({
      ...display,
      nightBrightness: intVal,
    });
  };

  return (
    <Box py={2}>
      <TextField
        select
        label="Time zone"
        value={timeAdjustment.hour.toString()}
        onChange={changeTimeZone}
        fullWidth
        margin="normal"
      >
        {timeZones.map((zone) => (
          <MenuItem value={zone.toString()} key={zone}>
            UTC {zone === 0 ? '' : zone < 0 ? zone : `+${zone}`}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Daytime brightness"
        value={display.dayBrightness.toString()}
        onChange={changeDayBrightness}
        fullWidth
        margin="normal"
      >
        {new Array(16).fill(null).map((_, idx) => (
          <MenuItem value={idx.toString()} key={idx}>
            {idx + 1}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Nighttime brightness"
        value={display.nightBrightness.toString()}
        onChange={changeNightBrightness}
        fullWidth
        margin="normal"
      >
        {new Array(16).fill(null).map((_, idx) => (
          <MenuItem value={idx.toString()} key={idx}>
            {idx + 1}
          </MenuItem>
        ))}
      </TextField>
    </Box>
  );
}
