// The small mirrored self-view (a DOM <video>, bottom right) and its hide toggle. Hidden is remembered.
import { load, save } from "./store.js";

const box = () => document.getElementById("me");
export function showPreview(on) {
  box().hidden = !on;
  box().classList.toggle("off", !!load().hidePreview);
}
document.getElementById("me-toggle").addEventListener("click", () => {
  const off = !box().classList.contains("off");
  box().classList.toggle("off", off);
  save({ hidePreview: off });
});
