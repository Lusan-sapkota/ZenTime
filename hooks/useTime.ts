import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

export function useTime(tz?: string, interval: number = 500) {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    const timer = setInterval(() => {
      setNow(dayjs());
    }, interval);
    return () => clearInterval(timer);
  }, [interval]);
  return tz ? now.tz(tz) : now;
}
