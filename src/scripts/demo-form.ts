import { onPageLoad } from "./lifecycle";

/**
 * Request for Sample form: validates, then opens WhatsApp with the details as a prepared message.
 * Nothing is sent to a server and nothing is stored. Bound once; init() unbinds the previous
 * listeners first, so astro:page-load can call it again safely.
 */
let controller: AbortController | null = null;

type Field = "name" | "mobile" | "company" | "email" | "address";

const rules: Record<Field, (v: string) => string> = {
  name: (v) => (v.trim().length >= 2 ? "" : "Please enter your full name."),
  mobile: (v) =>
    /^(?:\+?91|0)?[6-9]\d{9}$/.test(v.replace(/[\s\-()]/g, "")) ? "" : "Enter a valid 10-digit mobile number (for example 98765 43210).",
  company: (v) => (v.trim().length >= 2 ? "" : "Please enter your company name."),
  email: (v) => (/^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v.trim()) ? "" : "Enter a valid email address (for example name@company.com)."),
  address: (v) => (v.trim().length >= 5 ? "" : "Please enter your address."),
};
const FIELDS = Object.keys(rules) as Field[];

function init(): void {
  controller?.abort();
  controller = new AbortController();
  const { signal } = controller;

  const form = document.querySelector<HTMLFormElement>("#demo");
  if (!form) return;
  const one = <T extends HTMLElement>(selector: string) => form.querySelector<T>(selector)!;
  const catsEl = one<HTMLElement>("#cats");
  const countEl = one<HTMLElement>("#count");
  const clearBtn = one<HTMLButtonElement>("#clear");
  const sum = one<HTMLElement>("#sum");
  const status = one<HTMLElement>("#status");
  const scrollBehavior = (): ScrollBehavior => (matchMedia("(prefers-reduced-motion: reduce)").matches ? "auto" : "smooth");

  const boxes = (): HTMLInputElement[] => Array.from(catsEl.querySelectorAll<HTMLInputElement>("input[type=checkbox]"));
  const cats = Array.from(catsEl.querySelectorAll<HTMLElement>("fieldset.cat"));

  function setErr(key: string, message: string): void {
    one<HTMLElement>(`#e-${key}`).textContent = message;
    if (key === "powders") return;
    one<HTMLElement>(`#${key}`).setAttribute("aria-invalid", message ? "true" : "false");
  }

  function updateCount(): void {
    const checked = boxes().filter((b) => b.checked);
    const n = checked.length;
    countEl.innerHTML = `<b>${n}</b> powder${n === 1 ? "" : "s"} selected`;
    clearBtn.disabled = n === 0;
    cats.forEach((cat, ci) => {
      const k = checked.filter((b) => b.dataset.cat === String(ci)).length;
      const total = cat.querySelectorAll("input[type=checkbox]").length;
      const el = one<HTMLElement>(`#n${ci}`);
      el.textContent = k ? `${k} selected` : `${total} ${total === 1 ? "product" : "products"}`;
      el.className = k ? "on" : "";
    });
    if (n) setErr("powders", "");
  }

  catsEl.addEventListener("change", updateCount, { signal });
  clearBtn.addEventListener(
    "click",
    () => {
      boxes().forEach((b) => (b.checked = false));
      updateCount();
    },
    { signal },
  );

  // ?product=<slug>: pre-check that powder and scroll the list to it
  const wanted = new URLSearchParams(location.search).get("product");
  const preset = wanted ? boxes().find((b) => b.value === wanted) : undefined;
  if (preset) {
    preset.checked = true;
    requestAnimationFrame(() => preset.closest("label")?.scrollIntoView({ block: "center", behavior: scrollBehavior() }));
  }
  updateCount();

  /* ---------- validation ---------- */
  FIELDS.forEach((key) => {
    const field = one<HTMLInputElement | HTMLTextAreaElement>(`#${key}`);
    field.addEventListener(
      "blur",
      () => {
        if (field.value || field.getAttribute("aria-invalid")) setErr(key, rules[key](field.value));
      },
      { signal },
    );
    field.addEventListener(
      "input",
      () => {
        if (field.getAttribute("aria-invalid") === "true") setErr(key, rules[key](field.value));
      },
      { signal },
    );
  });

  /* ---------- WhatsApp message ---------- */
  function buildMessage(d: Record<Field, string>): string {
    const lines = [
      "*NEW PRODUCT SAMPLE REQUEST*",
      "",
      "*CUSTOMER DETAILS*",
      "",
      `Full Name: ${d.name}`,
      `Mobile Number: ${d.mobile}`,
      `Company Name: ${d.company}`,
      `Email Address: ${d.email}`,
      `Address: ${d.address}`,
      "",
      "*SELECTED PRODUCTS*",
      "",
    ];
    cats.forEach((cat, ci) => {
      const picked = boxes()
        .filter((b) => b.checked && b.dataset.cat === String(ci))
        .map((b) => b.dataset.name ?? b.value);
      if (!picked.length) return;
      lines.push(`${cat.dataset.title}:`);
      picked.forEach((p) => lines.push(`- ${p}`));
      lines.push("");
    });
    lines.push("Please contact me to arrange a product Sample for the selected powders.");
    return lines.join("\n");
  }

  form.addEventListener(
    "submit",
    (event) => {
      event.preventDefault();
      status.className = "status";
      status.innerHTML = "";
      const data = {} as Record<Field, string>;
      let first: HTMLElement | null = null;
      FIELDS.forEach((key) => {
        const field = one<HTMLInputElement | HTMLTextAreaElement>(`#${key}`);
        data[key] = field.value.trim();
        const message = rules[key](field.value);
        setErr(key, message);
        if (message && !first) first = field;
      });
      if (!boxes().some((b) => b.checked)) {
        setErr("powders", "Please select at least one powder.");
        if (!first) first = boxes()[0];
      }
      sum.classList.toggle("show", Boolean(first));
      if (first) {
        const target = first as HTMLElement;
        const isBox = target instanceof HTMLInputElement && target.type === "checkbox";
        (isBox ? one<HTMLElement>("#powders") : target).scrollIntoView({ block: "center", behavior: scrollBehavior() });
        target.focus({ preventScroll: true });
        return;
      }

      const message = buildMessage(data);
      const number = String(form.dataset.whatsapp ?? "").replace(/\D/g, "");
      if (!/^\d{11,15}$/.test(number)) {
        status.className = "status show";
        status.innerHTML =
          "<b>WhatsApp number not configured yet.</b> Set <code>whatsappNumber</code> in the site data (country code and digits only). This is the message that will open in WhatsApp:<pre></pre>";
        status.querySelector("pre")!.textContent = message;
        status.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
        return;
      }
      const url = `https://wa.me/${number}?text=${encodeURIComponent(message)}`;
      const opened = window.open(url, "_blank", "noopener");
      status.className = "status show";
      status.innerHTML = `WhatsApp should open with your message ready. Please press <b>Send</b> there to deliver your request. Nothing has been sent yet. If WhatsApp did not open, <a href="${url}" target="_blank" rel="noopener">open it here</a>.`;
      if (!opened) status.scrollIntoView({ block: "nearest", behavior: scrollBehavior() });
    },
    { signal },
  );
}

onPageLoad(init);
