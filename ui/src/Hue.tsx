import * as React from 'react';
import { Settings } from './types';
import { Box, Typography, Button } from '@material-ui/core';
import { HueGroupSelect } from './HueGroupSelect';
import useSWR from 'swr';
import { HueTest } from './HueTest';

export type HueProps = {
  hueSettings: Settings['hue'];
  onHueSettingsChanged: (val: Settings['hue']) => void;
};

type BridgeResponse = {
  name: string;
};

export function Hue({ hueSettings, onHueSettingsChanged }: HueProps) {
  const changeGroup = (groupId: string | null) => {
    onHueSettingsChanged({
      lightGroupId: groupId,
    });
  };

  const { data: bridgeData, isValidating: loadingBridge } = useSWR<
    BridgeResponse
  >('/api/hue/bridge');

  const connect = async () => {
    const response = await fetch('/api/hue/connect', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      alert('Could not connect');
    }
  };

  return (
    <Box py={2}>
      <Typography variant="h4" gutterBottom>
        Hue
      </Typography>
      {bridgeData ? (
        <Box display="flex" flexDirection="column">
          <HueGroupSelect
            value={hueSettings?.lightGroupId}
            onChange={changeGroup}
          />
          <Typography variant="body2" paragraph>
            Test Hue connection
          </Typography>
          <HueTest />
        </Box>
      ) : (
        <Box display="flex" flexDirection="column">
          <Typography paragraph>
            Before connecting, press the button on your Hue bridge.
          </Typography>
          <Button
            variant="contained"
            onClick={connect}
            disabled={loadingBridge}
          >
            Connect Hue
          </Button>
        </Box>
      )}
    </Box>
  );
}
