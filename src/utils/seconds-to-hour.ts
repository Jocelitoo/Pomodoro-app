import { zeroLeft } from './zero-left';

export const secondsToHour = (seconds: number): string => {
  const hour: string = zeroLeft(seconds / 3600);
  const min: string = zeroLeft((seconds / 60) % 60);
  const sec: string = zeroLeft((seconds % 60) % 60);

  return `${hour}:${min}:${sec}`;
};
