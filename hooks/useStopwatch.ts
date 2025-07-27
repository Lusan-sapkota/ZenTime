import { useRef, useState } from 'react';

export function useStopwatch() {
  const [running, setRunning] = useState(false);
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);

  const start = () => {
    if (!running) {
      setRunning(true);
      const startTime = Date.now() - elapsed;
      intervalRef.current = setInterval(() => {
        setElapsed(Date.now() - startTime);
      }, 50);
    }
  };

  const stop = () => {
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  const reset = () => {
    setElapsed(0);
    setRunning(false);
    if (intervalRef.current) clearInterval(intervalRef.current);
  };

  return { running, elapsed, start, stop, reset };
}
