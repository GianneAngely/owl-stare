// localStorage that never throws (private windows, blocked storage).
const KEY = "owlstare.v1";
export function load() { try { return JSON.parse(localStorage.getItem(KEY)) ?? {}; } catch { return {}; } }
export function save(patch) { const data = { ...load(), ...patch }; try { localStorage.setItem(KEY, JSON.stringify(data)); } catch {} return data; }
