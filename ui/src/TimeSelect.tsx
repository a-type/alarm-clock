import React, { useState } from 'react';
import {
  Box,
  TextField,
  MenuItem,
  IconButton,
  makeStyles,
} from '@material-ui/core';
import { DeleteTwoTone, InsertInvitationOutlined } from '@material-ui/icons';
import clsx from 'clsx';
import { ChangeEvent } from 'react';
import { AlarmConfig } from './types';

const useStyles = makeStyles((theme) => ({
  root: {
    width: '100%',
    display: 'grid',
    gridTemplateAreas: '"hour minute"',
    gridTemplateColumns: '2fr 2fr',
    gridGap: theme.spacing(1),
  },
  clearButton: {
    fontSize: '8vmin',
    margin: 'auto',
  },
}));

const useInputStyles = makeStyles((theme) => ({
  root: {
    fontSize: '10vmin',
  },
}));

type TimeSelectProps = {
  value: Pick<AlarmConfig, 'hour' | 'minute'>;
  onChange: (newValue: Pick<AlarmConfig, 'hour' | 'minute'>) => void;
  className?: string;
};

export function TimeSelect({ value, onChange, className }: TimeSelectProps) {
  const [tempHour, setTempHour] = useState<number | null>(null);
  const classes = useStyles({});
  const inputClasses = useInputStyles({});

  const hour = value && value.hour;
  const minute = value && value.minute;

  const handleHourChange = (ev: ChangeEvent<any>) => {
    const intVal = parseInt(ev.target.value);
    if (hour === intVal) return;
    if (minute === null) {
      setTempHour(intVal);
    } else {
      onChange({
        hour: intVal,
        minute,
      });
    }
  };

  const handleMinuteChange = (ev: ChangeEvent<any>) => {
    const intVal = parseInt(ev.target.value);
    const finalHour = hour ?? tempHour;
    if (finalHour === null || minute === intVal) return;
    onChange({
      hour: finalHour,
      minute: intVal,
    });
  };

  return (
    <Box className={clsx(classes.root, className)}>
      <TextField
        select
        label="Hour"
        value={hour ?? tempHour}
        onChange={handleHourChange}
        fullWidth
        InputProps={{
          classes: inputClasses,
        }}
        style={{ gridArea: 'hour' }}
      >
        {new Array(24).fill(null).map((_, hr) => (
          <MenuItem key={hr} value={hr.toString()}>
            {hr}
          </MenuItem>
        ))}
      </TextField>
      <TextField
        select
        label="Min"
        value={minute}
        onChange={handleMinuteChange}
        fullWidth
        InputProps={{
          classes: inputClasses,
        }}
        style={{ gridArea: 'minute' }}
        disabled={hour === null && tempHour === null}
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
    </Box>
  );
}
