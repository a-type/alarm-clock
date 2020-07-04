import * as React from 'react';
import {
  makeStyles,
  Theme,
  Typography,
  TextField,
  MenuItem,
} from '@material-ui/core';
import useSWR from 'swr';

export type HueGroupSelectProps = {
  value: string | null;
  onChange: (newId: string | null) => void;
};

const useStyles = makeStyles<Theme, HueGroupSelectProps>((theme) => ({}));

type HueGroupsResponse = {
  id: string;
  name: string;
  type:
    | 'Lunimarie'
    | 'Lightsource'
    | 'LightGroup'
    | 'Room'
    | 'Entertainment'
    | 'Zone';
}[];

export function HueGroupSelect(props: HueGroupSelectProps) {
  const classes = useStyles(props);
  const { value, onChange } = props;

  const { data: groupData, isValidating, error: deviceError } = useSWR<
    HueGroupsResponse
  >('/api/hue/groups', {
    shouldRetryOnError: false,
  });

  if (deviceError) {
    return (
      <Typography variant="caption">
        Connect to Hue to choose a device
      </Typography>
    );
  }

  return (
    <TextField
      label="Choose a light group"
      select
      disabled={!groupData || isValidating}
      value={value || null}
      onChange={(ev) => onChange(ev.target.value)}
      fullWidth
      margin="normal"
    >
      {(groupData ?? []).map((group) => (
        <MenuItem value={group.id} key={group.id}>
          {group.name}
        </MenuItem>
      ))}
    </TextField>
  );
}
