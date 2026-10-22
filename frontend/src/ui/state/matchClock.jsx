import { useSyncExternalStore } from 'react';
// All simulated clocks share one interval. No timer exists without subscribers.
let now = Date.now();
let timer = null;
const listeners = new Set();
function tick() { if (typeof document !== 'undefined' && document.hidden) return; now = Date.now(); listeners.forEach(listener => listener()); }
function subscribe(listener) {
  listeners.add(listener);
  if (!timer) { now = Date.now(); timer = setInterval(tick, 1000); }
  return () => { listeners.delete(listener); if (!listeners.size) { clearInterval(timer); timer = null; } };
}
const idle = () => () => {};
export function useMatchNow(running) { return useSyncExternalStore(running ? subscribe : idle, () => now, () => now); }
