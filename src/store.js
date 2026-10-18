// localStorage that never throws (private windows, blocked storage).
const KEY = "owlstare.v1";
// Calibrations from before 19 Oct 2026 (v 2) have no resting eye opening (winks): drop them so the game calibrates again.
export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY)) ?? {};
    if (data.th && data.th.v !== 2) delete data.th;
    return data;
  } catch { return {}; }
}
export function save(patch) { const data = { ...load(), ...patch }; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} return data; }
