import React, { useState } from 'react';
import useSwr, { SWRConfig } from 'swr';
import { Alarms } from './Alarms';
import {
  Container,
  makeStyles,
  Tabs,
  Tab,
  Box,
  CircularProgress,
  Typography,
  ThemeProvider,
  CssBaseline,
  LinearProgress,
  Fade,
} from '@material-ui/core';
import { AlarmTwoTone, SettingsTwoTone } from '@material-ui/icons';
import { AlarmConfig, Settings } from './types';
import { darkTheme } from './theme/theme';
import { Settings as SettingsUI } from './Settings';
import { ApiError } from './ApiError';

const useStyles = makeStyles((theme) => ({
  container: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'flex-start',
    height: '100%',
  },
}));

function App() {
  const classes = useStyles({});
  const { data: settings, mutate } = useSwr<Settings>('/api/settings');

  const [saving, setSaving] = useState(false);

  const settingChangeHandler = <T extends keyof Settings>(
    settingKey: T,
  ) => async (val: Settings[T]) => {
    try {
      setSaving(true);
      const response = await fetch('/api/settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...settings,
          [settingKey]: val,
        }),
      });

      if (!response.ok) {
        throw new Error('Settings update failed');
      }

      const json = await response.json();
      mutate(json);
    } catch (err) {
      alert(err.message);
    } finally {
      setSaving(false);
    }
  };

  const [activeTab, setActiveTab] = useState(0);

  if (!settings) {
    return (
      <Box
        display="flex"
        flexDirection="column"
        alignItems="center"
        justifyContent="center"
        p={4}
      >
        <CircularProgress />
        <Typography variant="caption" style={{ marginTop: 16 }}>
          Connecting to clock
        </Typography>
      </Box>
    );
  }

  return (
    <Container className={classes.container}>
      <Fade
        in={saving}
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          transitionDelay: '800ms',
        }}
        unmountOnExit
      >
        <LinearProgress />
      </Fade>
      <Tabs
        value={activeTab}
        onChange={(_, v) => setActiveTab(v)}
        variant="fullWidth"
      >
        <Tab
          icon={<AlarmTwoTone />}
          label="Alarms"
          id="tab-alarms"
          aria-controls="tabpanel-alarms"
        />
        <Tab
          icon={<SettingsTwoTone />}
          label="Settings"
          id="tab-settings"
          aria-controls="tabpanel-settings"
        />
      </Tabs>
      <Box
        id={`tabpanel-alarms`}
        role="tabpanel"
        hidden={activeTab !== 0}
        aria-labelledby="tab-alarms"
        width="100%"
        flex={1}
      >
        <Alarms
          alarms={settings.alarms}
          onChange={settingChangeHandler('alarms')}
        />
      </Box>
      <Box
        id="tabpanel-settings"
        role="tabpanel"
        hidden={activeTab !== 1}
        aria-labelledby="tab-settings"
        width="100%"
        flex={1}
      >
        <SettingsUI
          timeAdjustment={settings.timeAdjustment}
          onTimeAdjustmentChanged={settingChangeHandler('timeAdjustment')}
        />
      </Box>
    </Container>
  );
}

const swrConfig = {
  fetcher: (...args: [any, any]) =>
    fetch(...args).then((res) => {
      if (!res.ok) {
        const error = new ApiError('Request failed', res);
        throw error;
      }
      return res.json();
    }),
};

export default function () {
  return (
    <SWRConfig value={swrConfig}>
      <ThemeProvider theme={darkTheme}>
        <App />
        <CssBaseline />
      </ThemeProvider>
    </SWRConfig>
  );
}
