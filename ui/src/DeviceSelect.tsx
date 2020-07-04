import * as React from 'react';
import {
  makeStyles,
  Theme,
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core';
import useSWR from 'swr';

export type DeviceSelectProps = {
  value: string | null;
  onChange: (newId: string | null) => void;
};

const useStyles = makeStyles<Theme, DeviceSelectProps>((theme) => ({}));

type DevicesResponse = {
  devices: {
    id: string;
    name: string;
    is_active: boolean;
    is_restricted: boolean;
    type: string;
  }[];
};

export function DeviceSelect(props: DeviceSelectProps) {
  const classes = useStyles(props);
  const { value, onChange } = props;

  const { data: deviceData, isValidating, error: deviceError } = useSWR<
    DevicesResponse
  >('/api/spotify/devices', {
    shouldRetryOnError: false,
  });

  if (deviceError) {
    return (
      <Typography variant="caption">
        Connect Spotify to choose a device
      </Typography>
    );
  }

  return (
    <TextField
      label="Choose a device"
      helperText="Find the Spotify device name that we should play music on in the morning - probably this clock."
      select
      disabled={!deviceData || isValidating}
      value={value || null}
      onChange={(ev) => onChange(ev.target.value)}
      fullWidth
      margin="normal"
    >
      {(deviceData?.devices ?? []).map((device) => (
        <MenuItem value={device.id} key={device.id}>
          {device.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
