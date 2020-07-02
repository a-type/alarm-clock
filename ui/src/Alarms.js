import React from 'react';
import { Box, Typography, makeStyles } from '@material-ui/core';
import { TimeSelect } from './TimeSelect';

const DAYS = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

const useStyles = makeStyles(theme => ({

}));

export function Alarms({ alarms = {}, onChange }) {
  const classes = useStyles({});

  const changeHandler = day => newValue => {
    onChange({
      ...alarms,
      [day]: newValue
    });
  };

  return (
    <Box display="flex" flexDirection="column">
      {DAYS.map(day => (
        <Box display="flex" flexDirection="row" mb={3} key={day}>
          <Typography variant="label">{day}</Typography>
          <TimeSelect value={alarms[day] || null} onChange={changeHandler(day)} />
        </Box>
      ))}
    </Box>
  )
}
