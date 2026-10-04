// One place that reads/writes the shortlist, so the navbar count and the predictor never disagree.
const KEY = 'shortlist';
const EVENT = 'shortlist-updated';

export function readShortlist() {
  try { return JSON.parse(localStorage.getItem(KEY) || '[]'); } catch { return []; }
}

export function writeShortlist(list) {
  try { localStorage.setItem(KEY, JSON.stringify(list)); } catch { /* storage blocked: ignore */ }
  window.dispatchEvent(new Event(EVENT));
}

// Returns an "unsubscribe" function. Also fires when another browser tab changes the list.
export function subscribeShortlist(callback) {
  window.addEventListener(EVENT, callback);
  window.addEventListener('storage', callback);
  return () => {
    window.removeEventListener(EVENT, callback);
    window.removeEventListener('storage', callback);
  };
}
