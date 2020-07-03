export type AlarmConfig = {
  hour: number | null;
  minute: number | null;
  playlistId: string | null;
};

export type Settings = {
  alarms: Record<string, AlarmConfig>;
  timeAdjustment: {
    hour: number;
    minute: number;
  };
};
