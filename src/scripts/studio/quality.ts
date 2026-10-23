/**
 * Adaptive quality governor for the Powder Studio. The start tier depends on the device; while the
 * studio is on screen the governor averages frame time over two seconds and steps down one tier if
 * it is slower than 24 ms. It never steps back up in a session.
 *
 * Debug / QA: `?quality=high|mid|low|static` forces a tier with no adaptation, `?quality=auto`
 * runs the real logic even under automation (automation otherwise stays on HIGH, because software
 * WebGL would always look slow).
 */

export type Tier = "HIGH" | "MID" | "LOW" | "STATIC";
export const TIERS: Tier[] = ["HIGH", "MID", "LOW", "STATIC"];

export interface TierConfig {
  /** Max width of the shared WebGL canvas in device pixels. */
  maxWidth: number;
  /** Max device pixel ratio used to size it. */
  dpr: number;
  /** Minimum ms between renders of a neighbouring fruit: 0 = whenever asked, Infinity = never (cached frame). */
  neighbourMs: number;
  /** Grains in the powder effect. */
  particles: number;
}

export const TIER_CONFIG: Record<Tier, TierConfig> = {
  HIGH: { maxWidth: 960, dpr: 2, neighbourMs: 0, particles: 1500 },
  MID: { maxWidth: 720, dpr: 1.5, neighbourMs: 100, particles: 900 }, // about every 6th frame
  LOW: { maxWidth: 480, dpr: 1, neighbourMs: Infinity, particles: 500 },
  STATIC: { maxWidth: 0, dpr: 1, neighbourMs: Infinity, particles: 0 },
};

export const SLOW_FRAME_MS = 24;
const WINDOW_MS = 2000;
const WARMUP_MS = 1000;

interface Start {
  tier: Tier;
  adaptive: boolean;
  reason: string;
}

function pickStart(): Start {
  const query = new URLSearchParams(location.search).get("quality")?.toUpperCase();
  if (query && (TIERS as string[]).includes(query)) return { tier: query as Tier, adaptive: false, reason: "forced by ?quality" };

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return { tier: "STATIC", adaptive: false, reason: "reduced motion" };
  if (nav.connection?.saveData) return { tier: "STATIC", adaptive: false, reason: "save-data" };
  if (nav.webdriver && query !== "AUTO") return { tier: "HIGH", adaptive: false, reason: "automation" };

  const touch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  if (touch) {
    const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    return weak ? { tier: "LOW", adaptive: true, reason: "touch, few cores or little memory" } : { tier: "MID", adaptive: true, reason: "touch" };
  }
  return { tier: "HIGH", adaptive: true, reason: "desktop" };
}

let start: Start | null = null;
let current: Tier = "HIGH";

function ensure(): Start {
  if (!start) {
    start = pickStart();
    current = start.tier;
    if (import.meta.env.DEV) console.info(`[studio] quality tier: ${current} (${start.reason})`);
  }
  return start;
}

/** Current tier; chooses the start tier on first use. */
export function getTier(): Tier {
  ensure();
  return current;
}

export function isAdaptive(): boolean {
  return ensure().adaptive;
}

/** Steps one tier down (never up). Returns the new tier, or null if already at the bottom. */
export function stepDown(reason: string): Tier | null {
  const i = TIERS.indexOf(getTier());
  if (i >= TIERS.length - 1) return null;
  const from = current;
  current = TIERS[i + 1];
  if (import.meta.env.DEV) console.info(`[studio] quality tier: ${from} -> ${current} (${reason})`);
  return current;
}

/**
 * Frame-time monitor. Runs only while `target` is on screen and the tab is visible; leaving and
 * returning restarts the measurement window. Returns a function that stops it.
 */
export function startGovernor(target: Element | null, onSlow: (avgMs: number) => void): () => void {
  let raf = 0;
  let last = 0;
  let sum = 0;
  let frames = 0;
  let warm = WARMUP_MS;
  let visible = true;

  const reset = () => {
    sum = 0;
    frames = 0;
  };

  const loop = (now: number) => {
    raf = requestAnimationFrame(loop);
    // Pauses are handled by sync() (it restarts the window), so a long frame here is a slow frame.
    const dt = Math.min(now - last, 500);
    last = now;
    if (warm > 0) {
      warm -= dt;
      return;
    }
    sum += dt;
    frames++;
    if (sum >= WINDOW_MS) {
      const avg = sum / frames;
      reset();
      if (avg > SLOW_FRAME_MS) onSlow(avg);
    }
  };

  const sync = () => {
    const run = visible && !document.hidden;
    if (run && !raf) {
      last = performance.now();
      reset();
      raf = requestAnimationFrame(loop);
    } else if (!run && raf) {
      cancelAnimationFrame(raf);
      raf = 0;
    }
  };

  const io = target
    ? new IntersectionObserver(([entry]) => {
        visible = entry.isIntersecting;
        sync();
      })
    : null;
  io?.observe(target!);
  document.addEventListener("visibilitychange", sync);
  sync();

  return () => {
    cancelAnimationFrame(raf);
    raf = 0;
    io?.disconnect();
    document.removeEventListener("visibilitychange", sync);
  };
}
