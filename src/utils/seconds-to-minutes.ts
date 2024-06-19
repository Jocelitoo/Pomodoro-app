import { zeroLeft } from './zero-left';

export const secondsToMinutes = (seconds: number): string => {
  const min: string = zeroLeft((seconds / 60) % 60);
  const sec: string = zeroLeft((seconds % 60) % 60);

  return `${min}:${sec}`;
};
