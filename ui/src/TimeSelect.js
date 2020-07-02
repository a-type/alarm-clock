import React from 'react';
import { Box, TextField, MenuItem, IconButton } from '@material-ui/core';
import { DeleteTwoTone } from '@material-ui/icons';

export function TimeSelect({ value, onChange, className }) {
  const hour = value && value.hour;
  const minute = value && value.minute;

  const handleHourChange = (ev) => {
    if (minute === null) return;
    onChange({
      hour: parseInt(ev.target.value),
      minute,
    });
  };

  const handleMinuteChange = (ev) => {
    if (hour === null) return;
    onChange({
      hour,
      minute: parseInt(ev.target.value),
    });
  };

  const clear = () => {
    onChange(null);
  };

  return (
    <Box className={className}>
      <TextField
        select
        variant="filled"
        label="Hour"
        value={hour}
        onChange={handleHourChange}
        margin="normal"
        style={{ width: 120 }}
      >
        {new Array(24).fill(null).map((_, hr) => (
          <MenuItem key={hr} value={hr.toString()}>
            {hr}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        variant="filled"
        label="Min"
        value={minute}
        onChange={handleMinuteChange}
        margin="normal"
        style={{ width: 120 }}
      >
        {new Array(12)
          .fill(null)
          .map((_, i) => i * 5)
          .map((min) => (
            <MenuItem key={min} value={min.toString()}>
              {min.toString().padStart(2, '0')}
            </MenuItem>
          ))}
      </TextField>
      {value && (
        <IconButton onClick={clear}>
          <DeleteTwoTone />
        </IconButton>
      )}
    </Box>
  );
}
