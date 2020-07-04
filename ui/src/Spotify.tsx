import * as React from 'react';
import {
  makeStyles,
  Theme,
  Box,
  Button,
  Link,
  Typography,
} from '@material-ui/core';
import useSWR from 'swr';
import { DeviceSelect } from './DeviceSelect';
import { TestPlayback } from './TestPlayback';
import { CheckCircleTwoTone } from '@material-ui/icons';

export type SpotifyProps = {
  spotifySettings: {
    deviceId: string | null;
  };
  onSpotifySettingsChanged: (newValue: { deviceId: string | null }) => void;
};

const useStyles = makeStyles<Theme, SpotifyProps>(() => ({}));

export function Spotify(props: SpotifyProps) {
  const { spotifySettings, onSpotifySettingsChanged } = props;

  const { data: spotifyUserData, isValidating: loadingSpotify } = useSWR(
    '/api/spotify/user',
  );

  const changeDevice = (deviceId: string | null) => {
    onSpotifySettingsChanged({
      deviceId,
    });
  };

  return (
    <Box py={2}>
      {spotifyUserData?.user ? (
        <Box my={2}>
          <Typography variant="h4" gutterBottom>
            Spotify
          </Typography>
          <Box display="flex" flexDirection="row" alignItems="center">
            <CheckCircleTwoTone style={{ marginRight: 8 }} />
            <Typography color="primary">
              Connected to Spotify as {spotifyUserData.user.display_name}
            </Typography>
          </Box>
          <DeviceSelect
            value={spotifySettings?.deviceId ?? null}
            onChange={changeDevice}
          />
          <TestPlayback deviceId={spotifySettings?.deviceId} />
        </Box>
      ) : (
        <Button
          variant="contained"
          component={Link as any}
          underline="never"
          href="/spotifyLogin"
          disabled={loadingSpotify}
        >
          Connect Spotify
        </Button>
      )}
    </Box>
  );
}
