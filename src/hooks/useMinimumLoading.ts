import { useEffect, useRef, useState } from 'react';

export function useMinimumLoading(active: boolean, minimumMs = 1000) {
  const [visible, setVisible] = useState(active);
  const startedAtRef = useRef(active ? Date.now() : 0);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }

    if (active) {
      startedAtRef.current = Date.now();
      setVisible(true);
      return;
    }

    if (!visible) return;

    const elapsed = Date.now() - startedAtRef.current;
    const remaining = Math.max(minimumMs - elapsed, 0);

    timeoutRef.current = setTimeout(() => {
      setVisible(false);
      timeoutRef.current = null;
    }, remaining);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
        timeoutRef.current = null;
      }
    };
  }, [active, minimumMs, visible]);

  return visible;
}
