"use client";

import { useCallback, useEffect, useState } from "react";

/** useState that survives reloads via localStorage. Swap for API calls when a database is connected. */
export function usePersistentState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(initial);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    try {
      const raw = localStorage.getItem(`nk:${key}`);
      if (raw) setValue(JSON.parse(raw) as T);
    } catch {
      // ignore corrupt storage
    }
    setHydrated(true);
  }, [key]);

  useEffect(() => {
    if (hydrated) localStorage.setItem(`nk:${key}`, JSON.stringify(value));
  }, [key, value, hydrated]);

  const reset = useCallback(() => setValue(initial), [initial]);
  return [value, setValue, reset] as const;
}
