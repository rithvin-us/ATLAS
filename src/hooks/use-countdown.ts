import { useEffect, useState, useMemo } from 'react';

export interface CountdownResult {
  display: string;
  isActive: boolean;
  timeRemaining: number;
}

/**
 * Hook for real-time countdown display.
 * Returns human-readable time remaining and whether countdown is active.
 */
export function useCountdown(endDate: Date | null): CountdownResult | null {
  const [now, setNow] = useState(new Date());

  useEffect(() => {
    const interval = setInterval(() => setNow(new Date()), 1000);
    return () => clearInterval(interval);
  }, []);

  return useMemo(() => {
    if (!endDate) return null;

    const diff = endDate.getTime() - now.getTime();

    if (diff <= 0) {
      return { display: 'Closed', isActive: false, timeRemaining: 0 };
    }

    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));

    let display = '';
    if (days > 0) display = `${days}d ${hours}h left`;
    else if (hours > 0) display = `${hours}h ${minutes}m left`;
    else display = `${minutes}m left`;

    return { display, isActive: true, timeRemaining: diff };
  }, [endDate, now]);
}
