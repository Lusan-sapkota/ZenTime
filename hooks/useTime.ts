import { useEffect, useState } from 'react';
import dayjs from 'dayjs';
import timezone from 'dayjs/plugin/timezone';
dayjs.extend(timezone);

export function useTime(tz?: string, interval: number = 1000) {
  const [now, setNow] = useState(() => dayjs());
  useEffect(() => {
    let cancelled = false;
    let timeout: ReturnType<typeof setTimeout> | null = null;
    let intervalId: ReturnType<typeof setInterval> | null = null;

    function cleanup() {
      cancelled = true;
      if (timeout) clearTimeout(timeout);
      if (intervalId) clearInterval(intervalId);
    }

    function startTimer() {
      if (cancelled) return;
      const nowTime = dayjs();
      setNow(nowTime);
      const msToNextSecond = interval - nowTime.millisecond();
      timeout = setTimeout(() => {
        if (cancelled) return;
        setNow(dayjs());
        intervalId = setInterval(() => {
          if (!cancelled) setNow(dayjs());
        }, interval);
      }, msToNextSecond);
    }

    startTimer();
    return cleanup;
  }, [interval]);
  return tz ? now.tz(tz) : now;
}
