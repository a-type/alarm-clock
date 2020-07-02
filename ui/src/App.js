import React from 'react';
import logo from './logo.svg';
import './App.css';
import useSwr, { SWRConfig } from 'swr';
import { Alarms } from './Alarms';

function App() {
  const { data: settings, mutate } = useSwr('/api/settings');

  const handleAlarmsChange = async newAlarms => {
    try {
      const response = await fetch('/api/settings', {
        method: 'PUT',
        body: {
          ...settings,
          alarms: newAlarms
        },
      });

      if (!response.ok) {
        throw new Error('Settings update failed');
      }

      const json = await response.json();
      mutate(json);
    } catch (err) {
      alert(err.message);
    }
  }

  return (
    <div className="App">
      <p>
        {JSON.stringify(settings)}
      </p>
      {settings && (
        <>
          <Alarms alarms={settings.alarms} onChange={handleAlarmsChange} />
        </>
      )}
    </div>
  );
}

const swrConfig = {
  fetcher: (...args) => fetch(...args).then(res => res.json())
};

export default function() {
  return (
    <SWRConfig value={swrConfig}>
      <App />
    </SWRConfig>
  )
};
