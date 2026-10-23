import { scrollLock } from "./scroll";
import { onPageLoad } from "./lifecycle";

const LOCK = "mobile-menu";
const FOCUSABLE = 'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])';
const SKIP_TAGS = new Set(["SCRIPT", "STYLE", "LINK", "TEMPLATE", "NOSCRIPT"]);

let controller: AbortController | null = null;
let inerted: HTMLElement[] = [];
let closeMenu: (restoreFocus: boolean) => void = () => {};

function setup(): void {
  // Re-binding (initial load, astro:page-load) must leave no stale state behind.
  closeMenu(false);
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.querySelector<HTMLElement>("[data-menu-root]");
  const panel = document.getElementById("mobile-menu");
  const toggle = document.querySelector<HTMLButtonElement>("[data-menu-toggle]");
  const closeBtn = document.querySelector<HTMLButtonElement>("[data-menu-close]");
  const backdrop = document.querySelector<HTMLElement>("[data-menu-backdrop]");
  if (!root || !panel || !toggle) return;

  const desktop = window.matchMedia("(min-width: 1024px)");
  let isOpen = false;

  const focusables = (): HTMLElement[] =>
    Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE)).filter((el) => el.offsetParent !== null || el === document.activeElement);

  function inertSiblings(): void {
    inerted = Array.from(document.body.children).filter(
      (el): el is HTMLElement => el instanceof HTMLElement && el !== root && !SKIP_TAGS.has(el.tagName) && !el.inert,
    );
    inerted.forEach((el) => (el.inert = true));
  }

  function restoreSiblings(): void {
    inerted.forEach((el) => (el.inert = false));
    inerted = [];
  }

  function open(): void {
    if (isOpen) return;
    isOpen = true;
    root!.dataset.open = "true";
    panel!.inert = false;
    toggle!.setAttribute("aria-expanded", "true");
    inertSiblings();
    scrollLock.lock(LOCK);
    requestAnimationFrame(() => (closeBtn ?? focusables()[0])?.focus());
  }

  function close(restoreFocus: boolean): void {
    if (!isOpen) return;
    isOpen = false;
    root!.dataset.open = "false";
    panel!.inert = true;
    toggle!.setAttribute("aria-expanded", "false");
    restoreSiblings();
    scrollLock.unlock(LOCK);
    if (restoreFocus) toggle!.focus();
  }

  closeMenu = close;

  toggle.addEventListener("click", () => (isOpen ? close(true) : open()), { signal });
  closeBtn?.addEventListener("click", () => close(true), { signal });
  backdrop?.addEventListener("click", () => close(true), { signal });
  panel.addEventListener(
    "click",
    (event) => {
      if ((event.target as HTMLElement).closest("a[href]")) close(false);
    },
    { signal },
  );

  document.addEventListener(
    "keydown",
    (event) => {
      if (!isOpen) return;
      if (event.key === "Escape") {
        event.preventDefault();
        close(true);
        return;
      }
      if (event.key !== "Tab") return;
      const items = focusables();
      if (items.length === 0) return;
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement;
      if (event.shiftKey && (active === first || !panel.contains(active))) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && (active === last || !panel.contains(active))) {
        event.preventDefault();
        first.focus();
      }
    },
    { signal },
  );

  desktop.addEventListener("change", (event) => event.matches && close(false), { signal });
  window.addEventListener("pagehide", () => close(false), { signal });
}

onPageLoad(setup);
