export type AlarmConfig = {
  hour: number | null;
  minute: number | null;
  playlistUri: string | null;
  disabled: boolean;
};

export type Settings = {
  alarms: Record<string, AlarmConfig>;
  timeAdjustment: {
    hour: number;
    minute: number;
  };
  spotify: {
    deviceId: string | null;
  };
};
