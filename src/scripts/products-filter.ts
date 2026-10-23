import { onPageLoad } from "./lifecycle";

/**
 * /products: category chips and live search. Everything is server-rendered; this only hides
 * cards that do not match. The category lives in the URL hash (#fruit-powders), "all" has none.
 */
let controller: AbortController | null = null;

function init(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const root = document.querySelector<HTMLElement>("[data-products]");
  if (!root) return;
  const chips = Array.from(root.querySelectorAll<HTMLButtonElement>("[data-filter]"));
  const cards = Array.from(root.querySelectorAll<HTMLElement>("[data-card]"));
  const input = root.querySelector<HTMLInputElement>("[data-search]");
  const status = root.querySelector<HTMLElement>("[data-status]");
  const empty = root.querySelector<HTMLElement>("[data-empty]");

  const fromHash = (): string => {
    const hash = location.hash.slice(1);
    return chips.some((c) => c.dataset.filter === hash) ? hash : "all";
  };

  let category = fromHash();
  let terms: string[] = [];

  function apply(): void {
    let shown = 0;
    for (const card of cards) {
      const inCategory = category === "all" || card.dataset.category === category;
      const matches = terms.every((t) => (card.dataset.haystack ?? "").includes(t));
      const show = inCategory && matches;
      card.hidden = !show;
      if (show) shown++;
    }
    chips.forEach((c) => c.setAttribute("aria-pressed", String(c.dataset.filter === category)));
    if (status) status.textContent = `Showing ${shown} of ${cards.length} products`;
    if (empty) empty.hidden = shown > 0;
  }

  chips.forEach((chip) =>
    chip.addEventListener(
      "click",
      () => {
        category = chip.dataset.filter ?? "all";
        try {
          history.replaceState(null, "", category === "all" ? location.pathname + location.search : `#${category}`);
        } catch {
          /* history unavailable: filtering still works */
        }
        apply();
      },
      { signal },
    ),
  );

  input?.addEventListener(
    "input",
    () => {
      terms = input.value.toLowerCase().split(/\s+/).filter(Boolean);
      apply();
    },
    { signal },
  );

  window.addEventListener(
    "hashchange",
    () => {
      category = fromHash();
      apply();
    },
    { signal },
  );

  apply();
}

onPageLoad(init);
