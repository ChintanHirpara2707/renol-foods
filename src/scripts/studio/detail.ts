import { gsap } from "gsap";
import { products, type ProductItem } from "../../data/products";

export interface DetailCallbacks {
  onClose: () => void;
  onSwapProduct: (newIndex: number) => void;
  onRequestSample?: (product: ProductItem) => void;
}

export class PowderDetail {
  private container: HTMLElement;
  private detailEl: HTMLElement;
  private dbgs: HTMLElement[] = [];
  private callbacks: DetailCallbacks;
  private isReducedMotion: boolean = false;
  private n: number = products.length;

  private boundKeyDown: (e: KeyboardEvent) => void;
  private boundPopState: () => void;
  private boundDlgClick: (e: MouseEvent) => void;

  constructor(container: HTMLElement, callbacks: DetailCallbacks) {
    this.container = container;
    this.callbacks = callbacks;
    this.detailEl = container.querySelector("#detail") as HTMLElement;
    this.isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    this.buildDbgs();
    this.setupDialog();
    this.setupNavigation();
  }

  private mod(a: number, b: number): number {
    return ((a % b) + b) % b;
  }

  private buildDbgs() {
    const host = this.detailEl.querySelector("#dbgs") as HTMLElement;
    if (!host) return;
    host.innerHTML = "";
    this.dbgs = products.map((p) => {
      const d = document.createElement("div");
      d.className = "bg";
      d.style.setProperty("--glow", p.glow);
      d.style.setProperty("--base", p.base);
      host.appendChild(d);
      return d;
    });
  }

  public fillDetail(i: number) {
    const p = products[i];
    if (!p) return;

    this.detailEl.style.setProperty("--accent", p.accent);
    this.detailEl.style.setProperty("--on", "#140a00");
    this.detailEl.style.setProperty("--pouch", p.pouch);
    this.detailEl.style.setProperty("--powder", p.powder);
    document.documentElement.style.setProperty("--accent", p.accent);
    document.documentElement.style.setProperty("--glow", p.glow);
    document.documentElement.dataset.activeProduct = p.id;

    this.dbgs.forEach((b, k) => b.classList.toggle("on", k === i));

    const setTxt = (sel: string, val: string) => {
      const el = this.detailEl.querySelector(sel);
      if (el) el.textContent = val;
    };

    setTxt("#dName", `${p.name} Powder`);
    setTxt("#dBlurb", p.blurb);
    setTxt("#dCat", `${p.cat} powder`);
    setTxt("#pouchName", p.name);
    setTxt("#pouchSub", `${p.cat} powder`);

    const prevIdx = this.mod(i - 1, this.n);
    const nextIdx = this.mod(i + 1, this.n);
    setTxt("#dPrevN", products[prevIdx].name);
    setTxt("#dNextN", products[nextIdx].name);

    // Update inside & uses lists
    const insideEl = this.detailEl.querySelector("#dInside");
    if (insideEl) {
      insideEl.innerHTML = p.inside.map((x) => `<li>${x}</li>`).join("");
    }
    const usesEl = this.detailEl.querySelector("#dUses");
    if (usesEl) {
      usesEl.innerHTML = p.uses.map((x) => `<li>${x}</li>`).join("");
    }

    // Update specs if container exists
    const specsEl = this.detailEl.querySelector("#dSpecs");
    if (specsEl) {
      const specItems = [
        { label: "Form", val: p.form },
        { label: "Moisture", val: p.specs.moisture },
        { label: "Particle Size", val: p.specs.particleSize },
        { label: "Solubility", val: p.specs.solubility },
        { label: "Shelf Life", val: p.shelfLife },
        { label: "Storage", val: p.storage },
      ].filter((s) => s.val && !s.val.includes("[ADD"));

      if (specItems.length > 0) {
        specsEl.innerHTML = specItems
          .map((s) => `<dt>${s.label}</dt><dd>${s.val}</dd>`)
          .join("");
      } else {
        specsEl.innerHTML = `
          <dt>Form</dt><dd>${p.form}</dd>
          <dt>Aroma</dt><dd>${p.specs.aroma}</dd>
          <dt>Colour</dt><dd>${p.specs.colour}</dd>
          <dt>Storage</dt><dd>${p.storage}</dd>
        `;
      }
    }

    // Update SVG pouch & big fruit symbols
    const pouchFruit = this.detailEl.querySelector("#pouchFruit");
    if (pouchFruit) pouchFruit.setAttribute("href", `#f-${p.id}`);

    const bigFruit = this.detailEl.querySelector("#bigFruit");
    if (bigFruit) bigFruit.setAttribute("href", `#f-${p.id}`);
  }

  private setUrl(slug: string, replace = false) {
    try {
      const url = slug ? `/products/${slug}` : "/";
      if (replace) {
        history.replaceState({ inStudioDetail: !!slug, slug }, "", url);
      } else {
        history.pushState({ inStudioDetail: !!slug, slug }, "", url);
      }
    } catch {
      // Ignore pushState sandbox limitations
    }
  }

  public open(
    index: number,
    origin: { x: number; y: number },
    onCompleteCallback?: () => void
  ) {
    const p = products[index];
    this.fillDetail(index);
    document.body.classList.add("in-detail");
    (window as any).lenis?.stop();
    this.detailEl.style.display = "block";
    this.detailEl.inert = false;
    this.detailEl.scrollTop = 0;

    const maxR =
      Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y)
      ) + 10;

    const duration = this.isReducedMotion ? 0.01 : 1.0;

    gsap.set(this.detailEl, {
      clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
    });

    gsap.to(this.detailEl, {
      clipPath: `circle(${maxR}px at ${origin.x}px ${origin.y}px)`,
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        this.detailEl.style.clipPath = "none";
        const backBtn = this.container.querySelector("#back") as HTMLButtonElement | null;
        backBtn?.focus({ preventScroll: true });
        onCompleteCallback?.();
      },
    });

    if (!this.isReducedMotion) {
      gsap.from(this.detailEl.querySelector("#pwrap"), {
        y: 90,
        opacity: 0,
        rotation: -4,
        duration: 0.9,
        delay: 0.45,
        ease: "power3.out",
        clearProps: "all",
      });
      gsap.from(this.detailEl.querySelector(".mound"), {
        scaleX: 0.6,
        opacity: 0,
        transformOrigin: "50% 100%",
        duration: 0.8,
        delay: 0.5,
        ease: "power3.out",
        clearProps: "all",
      });
      gsap.from(this.detailEl.querySelectorAll(".dinfo > *"), {
        y: 22,
        opacity: 0,
        duration: 0.6,
        delay: 0.55,
        stagger: 0.05,
        ease: "power3.out",
        clearProps: "all",
      });
    }

    if (p) {
      this.setUrl(p.slug, false);
    }
  }

  public close(
    origin: { x: number; y: number },
    onCompleteCallback?: () => void
  ) {
    const maxR =
      Math.hypot(
        Math.max(origin.x, window.innerWidth - origin.x),
        Math.max(origin.y, window.innerHeight - origin.y)
      ) + 10;

    const duration = this.isReducedMotion ? 0.01 : 0.8;

    gsap.set(this.detailEl, {
      clipPath: `circle(${maxR}px at ${origin.x}px ${origin.y}px)`,
    });

    gsap.to(this.detailEl, {
      clipPath: `circle(0px at ${origin.x}px ${origin.y}px)`,
      duration,
      ease: "power2.inOut",
      onComplete: () => {
        this.detailEl.style.display = "none";
        this.detailEl.inert = true;
        document.body.classList.remove("in-detail");
        (window as any).lenis?.start();
        onCompleteCallback?.();
      },
    });

    if (window.location.pathname.startsWith("/products/")) {
      this.setUrl("", false);
    }
  }

  public swap(direction: -1 | 1, currentIndex: number) {
    const nextIdx = this.mod(currentIndex + direction, this.n);
    const duration = this.isReducedMotion ? 0.01 : 0.22;

    gsap.to(this.detailEl.querySelectorAll(".dswap"), {
      opacity: 0,
      y: 10,
      duration,
      onComplete: () => {
        this.fillDetail(nextIdx);
        this.detailEl.scrollTop = 0;
        this.setUrl(products[nextIdx].slug, true);
        this.callbacks.onSwapProduct(nextIdx);

        gsap.to(this.detailEl.querySelectorAll(".dswap"), {
          opacity: 1,
          y: 0,
          duration: this.isReducedMotion ? 0.01 : 0.35,
          clearProps: "all",
        });
      },
    });
  }

  private setupNavigation() {
    const backBtn = this.container.querySelector("#back");
    if (backBtn) {
      backBtn.addEventListener("click", () => this.callbacks.onClose());
    }

    const dPrev = this.detailEl.querySelector("#dPrev");
    const dNext = this.detailEl.querySelector("#dNext");
    if (dPrev) dPrev.addEventListener("click", () => this.swap(-1, this.getCurrentActive()));
    if (dNext) dNext.addEventListener("click", () => this.swap(1, this.getCurrentActive()));

    this.boundKeyDown = (e: KeyboardEvent) => {
      const dlg = document.getElementById("dlg") as HTMLDialogElement | null;
      if (dlg?.open) return;

      if (e.key === "Escape" && !this.detailEl.inert && this.detailEl.style.display !== "none") {
        this.callbacks.onClose();
      }
    };

    const unlockScroll = () => {
      document.body.classList.remove("in-detail");
      (window as any).lenis?.start();
    };

    this.boundPopState = () => {
      const isProductPath = window.location.pathname.startsWith("/products/");
      if (!this.detailEl.inert && !isProductPath) {
        this.callbacks.onClose();
        unlockScroll();
      } else if (isProductPath) {
        const slug = window.location.pathname.replace(/^\/products\/?/, "").replace(/\/$/, "");
        const idx = products.findIndex((p) => p.slug === slug || p.id === slug);
        if (idx >= 0 && idx !== this.getCurrentActive()) {
          this.fillDetail(idx);
          this.callbacks.onSwapProduct(idx);
        }
      } else {
        unlockScroll();
      }
    };

    window.addEventListener("keydown", this.boundKeyDown);
    window.addEventListener("popstate", this.boundPopState);
    document.addEventListener("astro:page-load", unlockScroll);
    document.addEventListener("astro:before-swap", unlockScroll);
  }

  private getCurrentActive(): number {
    const slug = window.location.pathname.replace(/^\/products\/?/, "").replace(/\/$/, "");
    if (slug) {
      const idx = products.findIndex((p) => p.slug === slug || p.id === slug);
      if (idx >= 0) return idx;
    }
    const hash = window.location.hash.slice(1);
    const hashIdx = products.findIndex((p) => p.id === hash || p.slug === hash);
    return hashIdx >= 0 ? hashIdx : 0;
  }

  private setupDialog() {
    const dlg = document.getElementById("dlg") as HTMLDialogElement | null;
    const sel = document.getElementById("fProd") as HTMLSelectElement | null;
    if (!dlg || !sel) return;

    sel.innerHTML = products
      .map((p) => `<option value="${p.id}">${p.name} powder</option>`)
      .join("");

    const openDlg = (prodId?: string) => {
      const activeId = prodId || products[this.getCurrentActive()].id;
      sel.value = activeId;
      const fForm = document.getElementById("fForm");
      const fDone = document.getElementById("fDone");
      const form = document.getElementById("sampleForm") as HTMLFormElement | null;
      if (fForm) fForm.hidden = false;
      if (fDone) fDone.hidden = true;
      if (form) form.reset();
      sel.value = activeId;
      dlg.showModal();
    };

    const reqTop = this.container.querySelector("#reqTop");
    const reqDetail = this.container.querySelector("#reqDetail");
    const toContact = this.container.querySelector("#toContact");

    if (reqTop) reqTop.addEventListener("click", () => openDlg());
    if (reqDetail) reqDetail.addEventListener("click", () => openDlg());
    if (toContact) toContact.addEventListener("click", () => openDlg());

    const dlgCancel = document.getElementById("dlgCancel");
    const dlgClose = document.getElementById("dlgClose");
    if (dlgCancel) dlgCancel.addEventListener("click", () => dlg.close());
    if (dlgClose) dlgClose.addEventListener("click", () => dlg.close());

    this.boundDlgClick = (e: MouseEvent) => {
      if (e.target === dlg) dlg.close();
    };
    dlg.addEventListener("click", this.boundDlgClick);

    const sampleForm = document.getElementById("sampleForm") as HTMLFormElement | null;
    if (sampleForm) {
      sampleForm.addEventListener("submit", (e) => {
        e.preventDefault();
        const f = new FormData(sampleForm);
        const prod = products.find((p) => p.id === f.get("p"));
        const fDoneTxt = document.getElementById("fDoneTxt");
        if (fDoneTxt && prod) {
          fDoneTxt.textContent = `Thanks ${f.get("n")}, your ${prod.name.toLowerCase()} powder sample request is noted. This is a prototype, so nothing was sent.`;
        }
        const fForm = document.getElementById("fForm");
        const fDone = document.getElementById("fDone");
        if (fForm) fForm.hidden = true;
        if (fDone) fDone.hidden = false;
      });
    }
  }

  public destroy() {
    document.body.classList.remove("in-detail");
    (window as any).lenis?.start();
    window.removeEventListener("keydown", this.boundKeyDown);
    window.removeEventListener("popstate", this.boundPopState);
    const dlg = document.getElementById("dlg") as HTMLDialogElement | null;
    if (dlg && this.boundDlgClick) {
      dlg.removeEventListener("click", this.boundDlgClick);
    }
  }
}
