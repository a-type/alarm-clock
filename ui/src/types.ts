export type AlarmConfig = {
  hour: number;
  minute: number;
} | null;

export type Settings = {
  alarms: Record<string, AlarmConfig>;
  timeAdjustment: {
    hour: number;
    minute: number;
  };
};
