/**
 * Quality tier for the Powder Studio's powder effect. The fruits are plain images, so only the
 * crush effect needs scaling: fewer grains on weak devices, a quick fade instead of the circular
 * reveal when the user prefers reduced motion or saves data.
 *
 * Debug / QA: `?quality=high|mid|low|static` forces a tier.
 */

export type Tier = "HIGH" | "MID" | "LOW" | "STATIC";
export const TIERS: Tier[] = ["HIGH", "MID", "LOW", "STATIC"];

/** Grains in the powder effect per tier. */
export const TIER_PARTICLES: Record<Tier, number> = { HIGH: 1500, MID: 900, LOW: 500, STATIC: 0 };

function pickTier(): { tier: Tier; reason: string } {
  const query = new URLSearchParams(location.search).get("quality")?.toUpperCase();
  if (query && (TIERS as string[]).includes(query)) return { tier: query as Tier, reason: "forced by ?quality" };

  const nav = navigator as Navigator & { deviceMemory?: number; connection?: { saveData?: boolean } };
  if (matchMedia("(prefers-reduced-motion: reduce)").matches) return { tier: "STATIC", reason: "reduced motion" };
  if (nav.connection?.saveData) return { tier: "STATIC", reason: "save-data" };

  const touch = matchMedia("(pointer: coarse)").matches || navigator.maxTouchPoints > 0;
  if (touch) {
    const weak = (nav.hardwareConcurrency ?? 8) <= 4 || (nav.deviceMemory ?? 8) <= 4;
    return weak ? { tier: "LOW", reason: "touch, few cores or little memory" } : { tier: "MID", reason: "touch" };
  }
  return { tier: "HIGH", reason: "desktop" };
}

let current: Tier | null = null;

/** Current tier; chosen on first use. */
export function getTier(): Tier {
  if (!current) {
    const { tier, reason } = pickTier();
    current = tier;
    if (import.meta.env.DEV) console.info(`[studio] quality tier: ${tier} (${reason})`);
  }
  return current;
}
