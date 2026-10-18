// localStorage that never throws (private windows, blocked storage).
const KEY = "owlstare.v1";
// Calibrations saved before 18 Oct 2026 have no per-eye lines (winks, far faces): drop them so the game calibrates again.
export function load() {
  try {
    const data = JSON.parse(localStorage.getItem(KEY)) ?? {};
    if (data.th && data.th.blinkL == null) delete data.th;
    return data;
  } catch { return {}; }
}
export function save(patch) { const data = { ...load(), ...patch }; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} return data; }
