import * as React from 'react';
import { Box, Button } from '@material-ui/core';

export type HueTestProps = {};

export function HueTest({}: HueTestProps) {
  const test = async (on: boolean) => {
    const response = await fetch('/api/hue/state', {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        on,
      }),
    });

    if (!response.ok) {
      alert('Playback failed: ' + response.status);
    }
  };

  return (
    <Box display="flex" flexDirection="row">
      <Button onClick={() => test(true)} style={{ marginRight: 8 }}>
        Turn on
      </Button>
      <Button onClick={() => test(false)}>Turn off</Button>
    </Box>
  );
}
