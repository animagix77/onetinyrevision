import { randomKey, validKey } from "./pages-host";
const storageKey = "com.judgedeanllc.onetinyrevision.guest";
let identity: Promise<string> | undefined;

function loadKey() {
  const fresh = randomKey();
  try {
    const saved = localStorage.getItem(storageKey);
    if (validKey(saved)) return saved;
    localStorage.setItem(storageKey, fresh);
  } catch {
    /* A storage-restricted browser can play for this page visit. */
  }
  return fresh;
}

export function guestKey() {
  // Two freshly opened tabs should still own the same plate.
  return (identity ??= navigator.locks
    ? navigator.locks.request(storageKey, loadKey).catch(loadKey)
    : Promise.resolve(loadKey()));
}
