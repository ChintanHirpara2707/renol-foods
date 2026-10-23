import Lenis from "lenis";

/**
 * Scroll lock with named locks. Several overlays can lock at once; the page
 * unlocks only when every lock is released. Everything is released on pagehide
 * and when a page is restored from the back/forward cache, so a lock can never
 * outlive its overlay.
 */
const locks = new Set<string>();
let lenis: Lenis | null = null;

function apply(): void {
  const locked = locks.size > 0;
  document.documentElement.classList.toggle("is-scroll-locked", locked);
  if (!lenis) return;
  if (locked) lenis.stop();
  else lenis.start();
}

export const scrollLock = {
  lock(key: string): void {
    locks.add(key);
    apply();
  },
  unlock(key: string): void {
    locks.delete(key);
    apply();
  },
  unlockAll(): void {
    locks.clear();
    apply();
  },
  get locked(): boolean {
    return locks.size > 0;
  },
};

declare global {
  interface Window {
    renolScroll?: typeof scrollLock;
    renolLenis?: Lenis | null;
  }
}

function lowPower(): boolean {
  const nav = navigator as Navigator & { connection?: { saveData?: boolean } };
  return Boolean(nav.connection?.saveData);
}

function startLenis(): void {
  if (lenis) return;
  lenis = new Lenis({
    autoRaf: true,
    lerp: 0.12,
    smoothWheel: true,
    syncTouch: false,
    anchors: { offset: -80 },
  });
  window.renolLenis = lenis;
  apply();
}

function stopLenis(): void {
  lenis?.destroy();
  lenis = null;
  window.renolLenis = null;
}

const reduced = window.matchMedia("(prefers-reduced-motion: reduce)");

function syncLenis(): void {
  if (reduced.matches || lowPower()) stopLenis();
  else startLenis();
}

window.renolScroll = scrollLock;
syncLenis();
reduced.addEventListener("change", syncLenis);

window.addEventListener("pagehide", () => {
  scrollLock.unlockAll();
  stopLenis();
});
window.addEventListener("pageshow", (event) => {
  if (event.persisted) {
    scrollLock.unlockAll();
    syncLenis();
  }
});
