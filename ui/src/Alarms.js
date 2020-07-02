import React from 'react';
import { Grid, Box, Typography, makeStyles } from '@material-ui/core';
import { TimeSelect } from './TimeSelect';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
];

const useStyles = makeStyles((theme) => ({
  timeSelectItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  timeSelect: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-start',
    alignItems: 'center',
  },
  dayLabelItem: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
}));

export function Alarms({ alarms = {}, onChange }) {
  const classes = useStyles({});

  const changeHandler = (day) => (newValue) => {
    console.log(newValue);
    onChange({
      ...alarms,
      [day]: newValue,
    });
  };

  return (
    <Grid container spacing={2}>
      {DAYS.map((day) => (
        <React.Fragment key={day}>
          <Grid item xs={12} md={6} className={classes.dayLabelItem}>
            <Typography variant="label">{day}</Typography>
          </Grid>
          <Grid item xs={12} md={6} className={classes.timeSelectItem}>
            <TimeSelect
              value={alarms[day] || null}
              onChange={changeHandler(day)}
              className={classes.timeSelect}
            />
          </Grid>
        </React.Fragment>
      ))}
    </Grid>
  );
}
