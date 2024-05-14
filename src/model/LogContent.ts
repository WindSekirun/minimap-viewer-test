export interface LogContent {
  id: number;
  log: string;
  style: LogStyle;
}

export enum LogStyle {
  NORMAL,
  WARNING,
  ERROR
}
