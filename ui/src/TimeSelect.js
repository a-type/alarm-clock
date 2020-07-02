import React from 'react';
import { Box, TextField, MenuItem, IconButton } from '@material-ui/core';
import { DeleteTwoTone } from '@material-ui/icons';

export function TimeSelect({ value, onChange, className }) {
  const hour = value && value.hour;
  const minute = value && value.minute;

  const handleHourChange = (ev, val) => {
    onChange({
      hour: parseInt(val),
      minute
    });
  };

  const handleMinuteChange = (ev, val) => {
    onChange({
      hour,
      minute: parseInt(val)
    });
  };

  const clear = () => {
    onChange(null);
  };

  return (
    <Box className={className}>
      <TextField select label="Hour" value={hour} onChange={handleHourChange} margin="normal">
        {new Array(24).fill(null).map((_, hr) => (
          <MenuItem key={hr} value={hr.toString().padStart(2, '0')}>{hr}</MenuItem>
        ))}
      </TextField>
      <TextField select label="Min" value={minute} onChange={handleMinuteChange} margin="normal">
        {new Array(12).fill(null).map((_, i) => i * 5).map(min => (
          <MenuItem key={min} value={min.toString().padStart(2, '0')}>{min.toString().padStart(2, '0')}</MenuItem>
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
