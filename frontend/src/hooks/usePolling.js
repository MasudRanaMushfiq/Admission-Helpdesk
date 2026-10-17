import { useEffect, useRef } from 'react';

// Runs now and every `ms`, paused while the tab is hidden
export default function usePolling(callback, ms) {
  const saved = useRef(callback);

  // Latest callback without restarting the timer
  useEffect(() => {
    saved.current = callback;
  });

  useEffect(() => {
    saved.current();
    const id = setInterval(() => {
      if (!document.hidden) saved.current();
    }, ms);
    return () => clearInterval(id);
  }, [ms]);
}
