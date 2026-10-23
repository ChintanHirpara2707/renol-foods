/**
 * Runs `fn` once the DOM is ready and again on every `astro:page-load`
 * (which only fires if a view-transition router is added later).
 * `fn` must be idempotent: abort previous listeners before re-binding.
 */
export function onPageLoad(fn: () => void): void {
  const run = () => fn();
  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", run, { once: true });
  } else {
    run();
  }
  document.addEventListener("astro:page-load", run);
}
