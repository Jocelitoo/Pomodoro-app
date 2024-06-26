import { useEffect, useRef } from 'react';

export const useInterval = <C extends CallableFunction>(
  callback: C,
  delay: number | null,
): void => {
  const savedCallback = useRef<C>();

  // Remember te latest callback
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);

  // Set up the interval
  useEffect(() => {
    function tick() {
      if (savedCallback.current) savedCallback.current();
    }
    if (delay !== null) {
      const id = setInterval(tick, delay);
      return () => clearInterval(id);
    }
  }, [delay]);
};
