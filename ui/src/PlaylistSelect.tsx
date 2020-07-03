import * as React from 'react';
import {
  makeStyles,
  Theme,
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core';
import useSWR from 'swr';

export type PlaylistSelectProps = {
  value: string | null;
  onChange: (newId: string | null) => void;
};

const useStyles = makeStyles<Theme, PlaylistSelectProps>((theme) => ({}));

type PlaylistsResponse = {
  playlists: {
    id: string;
    images: any[];
    name: string;
  }[];
};

export function PlaylistSelect(props: PlaylistSelectProps) {
  const classes = useStyles(props);
  const { value, onChange } = props;

  const { data: playlistData, isValidating, error: playlistError } = useSWR<
    PlaylistsResponse
  >('/api/spotify/playlists', {
    shouldRetryOnError: false,
  });

  if (playlistError) {
    return (
      <Typography variant="caption">
        Connect Spotify to choose a playlist
      </Typography>
    );
  }

  return (
    <TextField
      label="Playlist"
      select
      disabled={!playlistData || isValidating}
      value={value || null}
      onChange={(ev) => onChange(ev.target.value)}
      fullWidth
      margin="normal"
    >
      {(playlistData?.playlists ?? []).map((playlist) => (
        <MenuItem value={playlist.id} key={playlist.id}>
          {playlist.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
