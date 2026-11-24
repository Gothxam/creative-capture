"use client";

import { useEffect, useState } from "react";

const EVENT = "cc:ready";

export const isAppReady = () =>
  typeof document !== "undefined" && document.documentElement.dataset.ready === "true";

export const markAppReady = () => {
  if (typeof document === "undefined" || isAppReady()) return;
  document.documentElement.dataset.ready = "true";
  window.dispatchEvent(new Event(EVENT));
};

/**
 * True once the intro reveal has finished. Sections keyed to the first paint
 * (the hero) wait on this so their entrance isn't playing behind the curtain.
 */
export function useAppReady() {
  const [ready, setReady] = useState(false);

  useEffect(() => {
    if (isAppReady()) {
      setReady(true);
      return;
    }
    const on = () => setReady(true);
    window.addEventListener(EVENT, on, { once: true });
    return () => window.removeEventListener(EVENT, on);
  }, []);

  return ready;
}
