import React, { useState } from 'react';
import {
  Grid,
  Box,
  Typography,
  makeStyles,
  Tabs,
  Tab,
  Button,
} from '@material-ui/core';
import { TimeSelect } from './TimeSelect';
import SwipeableViews from 'react-swipeable-views';
import { AlarmConfig } from './types';
import { PlaylistSelect } from './PlaylistSelect';

const DAYS = [
  'sunday',
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
] as const;

const useStyles = makeStyles((theme) => ({
  timeSelect: {},
  dayHeading: {
    textTransform: 'capitalize',
  },
}));

const useTabStyles = makeStyles((theme) => ({
  root: {},
  selected: {
    fontWeight: 'bold',
  },
}));

const tomorrow = new Date().getDay() + 1;

type AlarmsProps = {
  alarms: Record<string, AlarmConfig>;
  onChange: (newValue: Record<string, AlarmConfig>) => void;
};

export function Alarms({ alarms = {}, onChange }: AlarmsProps) {
  const classes = useStyles({});
  const tabClasses = useTabStyles({});

  const [activeDayIndex, setActiveDayIndex] = useState(tomorrow);

  const changeHandler = (day: string) => (newValue: {
    hour: number | null;
    minute: number | null;
  }) => {
    onChange({
      ...alarms,
      [day]: {
        ...alarms[day],
        ...newValue,
      },
    });
  };

  const playlistChangeHandler = (day: string) => (
    playlistId: string | null,
  ) => {
    onChange({
      ...alarms,
      [day]: {
        ...alarms[day],
        playlistId,
      },
    });
  };

  return (
    <Box width="100%" height="100%" display="flex" flexDirection="column">
      <Tabs
        value={activeDayIndex}
        onChange={(_ev, val) => setActiveDayIndex(val)}
      >
        {DAYS.map((day, index) => (
          <Tab
            label={day[0].toUpperCase()}
            key={day}
            id={`tab-${index}`}
            aria-controls={`tabpanel-${index}`}
            classes={tabClasses}
          />
        ))}
      </Tabs>
      <SwipeableViews
        axis="x"
        index={activeDayIndex}
        onChangeIndex={setActiveDayIndex}
        style={{ flex: 1 }}
        containerStyle={{
          height: '100%',
        }}
        slideStyle={{
          height: '100%',
        }}
      >
        {DAYS.map((day, index) => (
          <Box
            display="flex"
            flexDirection="column"
            alignItems="flex-start"
            role="tabpanel"
            hidden={index !== activeDayIndex}
            id={`tabpanel-${index}`}
            aria-labelledby={`tab-${index}`}
            key={day}
            height="100%"
          >
            {activeDayIndex === index && (
              <>
                <Typography
                  variant="h5"
                  gutterBottom
                  className={classes.dayHeading}
                >
                  {day}
                </Typography>
                <Box flex={1} width="100%">
                  <TimeSelect
                    value={alarms[day] || null}
                    onChange={changeHandler(day)}
                    className={classes.timeSelect}
                  />
                  <PlaylistSelect
                    value={alarms[day].playlistId}
                    onChange={playlistChangeHandler(day)}
                  />
                </Box>
              </>
            )}
          </Box>
        ))}
      </SwipeableViews>
      <Box
        display="flex"
        width="100%"
        flexDirection="row"
        justifyContent="space-between"
        p={2}
      >
        <Button
          onClick={() =>
            setActiveDayIndex((c) => (c === 0 ? DAYS.length - 1 : c - 1))
          }
        >
          Prev
        </Button>
        <Button onClick={() => setActiveDayIndex((c) => (c + 1) % DAYS.length)}>
          Next
        </Button>
      </Box>
    </Box>
  );
}
