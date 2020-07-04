import * as React from 'react';
import { makeStyles, Theme, Box, Typography, Button } from '@material-ui/core';
import { PlaylistSelect } from './PlaylistSelect';

export type TestPlaybackProps = {
  deviceId: string | null;
};

const useStyles = makeStyles<Theme, TestPlaybackProps>((theme) => ({}));

export function TestPlayback(props: TestPlaybackProps) {
  const classes = useStyles(props);
  const { deviceId } = props;

  const [playlistUri, setPlaylistUri] = React.useState<string | null>(null);

  const test = async () => {
    const response = await fetch('/api/spotify/testPlayback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        playlistUri,
        deviceId,
      }),
    });

    if (!response.ok) {
      alert('Playback failed: ' + response.status);
    }
  };

  const stop = async () => {
    const response = await fetch('/api/spotify/stopPlayback', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
    });

    if (!response.ok) {
      alert('Stopping playback failed: ' + response.status);
    }
  };

  return (
    <Box my={2}>
      <Typography variant="h6">Test playback</Typography>
      <Typography variant="caption" gutterBottom>
        Test the connection to Spotify by manually invoking the same procedure
        we'll use to play music in the morning.
      </Typography>
      <PlaylistSelect value={playlistUri} onChange={setPlaylistUri} />
      <Box display="flex" flexDirection="row">
        <Button
          variant="outlined"
          onClick={test}
          disabled={!deviceId || !playlistUri}
          style={{ marginRight: 8 }}
        >
          Test
        </Button>
        <Button variant="text" onClick={stop}>
          Stop
        </Button>
      </Box>
    </Box>
  );
}
