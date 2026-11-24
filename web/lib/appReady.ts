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
 * True once the page is live on the client.
 *
 * This used to mean "once the intro loader has finished", so that entrances
 * were not playing behind a curtain. There is no curtain any more — the
 * counter that ran on every load is gone — so it resolves on mount instead.
 *
 * It still exists, and callers still wait on it, for two reasons: these are
 * entrance animations that must not run during server render, and if a
 * curtain ever comes back the sections are already keyed to it. Anything
 * that dispatches the ready event still works.
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
    // Nothing else will announce it now, so announce it here.
    markAppReady();
    return () => window.removeEventListener(EVENT, on);
  }, []);

  return ready;
}
