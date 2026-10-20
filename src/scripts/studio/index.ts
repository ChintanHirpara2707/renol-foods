import { gsap } from "gsap";
import { products } from "../../data/products";
import { PowderCarousel } from "./carousel";
import { PowderDetail } from "./detail";
import { PowderFxManager } from "./powder-fx";

export function initPowderStudio(root: HTMLElement): () => void {
  const canvas = root.querySelector("#fx") as HTMLCanvasElement;
  const stage = root.querySelector("#stage") as HTMLElement;
  const nameEl = root.querySelector("#name");
  const subEl = root.querySelector("#sub");

  if (!canvas || !stage) {
    return () => {};
  }

  const fxManager = new PowderFxManager(canvas);
  fxManager.sizeCanvas();

  let detailManager: PowderDetail;

  const carousel = new PowderCarousel(root, {
    onActivateCard: (index) => {
      transformToDetail(index);
    },
    onThemeChanged: () => {
      // Theme changed
    },
  });

  detailManager = new PowderDetail(root, {
    onClose: () => {
      closeDetailView();
    },
    onSwapProduct: (newIdx) => {
      carousel.active = newIdx;
      carousel.st.pos = newIdx;
      carousel.render();
      carousel.applyTheme();
    },
  });

  async function transformToDetail(index: number) {
    if (carousel.mode !== "browse") return;
    carousel.mode = "transform";

    const activeSpinner = carousel.getActiveSpinner();
    if (activeSpinner) {
      gsap.killTweensOf(activeSpinner.sp);
      activeSpinner.sp.f = Math.round(activeSpinner.sp.f);
      activeSpinner.draw();
    }

    const product = products[index];
    const card = carousel.getActiveCard();
    if (!card) return;
    const fruit = card.querySelector(".fruit") as HTMLElement;
    if (!fruit) return;

    const r = fruit.getBoundingClientRect();
    const hudElements = root.querySelectorAll(".hudfade");
    const otherCards = carousel.getCards().filter((_, k) => k !== index);

    gsap.to(hudElements, { opacity: 0, duration: 0.3, pointerEvents: "none" });
    gsap.to(otherCards, { opacity: 0.1, duration: 0.5 });

    const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    if (isReducedMotion) {
      carousel.mode = "detail";
      detailManager.open(index, { x: r.left + r.width / 2, y: r.bottom }, () => {
        stage.style.visibility = "hidden";
        stage.inert = true;
        fxManager.stop();
      });
      return;
    }

    // Pre-sample SVG or 360-canvas pixels for the powder crumble
    const samplePromise = activeSpinner
      ? Promise.resolve(activeSpinner.sampleCurrentPixels())
      : fxManager.getSvgFruitSamples(product.id);

    const tl = gsap.timeline();
    // Fruit shake
    tl.to(fruit, { rotation: -5, scale: 1.05, duration: 0.09, transformOrigin: "50% 62%" })
      .to(fruit, { rotation: 5, duration: 0.12 })
      .to(fruit, { rotation: -4, duration: 0.12 })
      .to(fruit, { rotation: 0, duration: 0.1 });

    let info: { ground: number; Hp: number; cx: number } | null = null;
    tl.add(async () => {
      const samples = await samplePromise;
      info = fxManager.start(r, product, samples);
    }, 0.42);

    tl.to(
      fruit,
      { scale: 0.82, opacity: 0, filter: "blur(8px)", duration: 0.9, ease: "power2.in" },
      0.42
    );

    tl.to([nameEl, subEl], { opacity: 0, duration: 0.2 }, 1.5);
    tl.add(() => {
      if (nameEl) nameEl.textContent = `${product.name} Powder`;
      if (subEl) subEl.textContent = "Ready to use";
    }, 1.7);
    tl.to([nameEl, subEl], { opacity: 1, duration: 0.3 }, 1.7);

    tl.add(() => {
      carousel.mode = "detail";
      const origin = info
        ? { x: info.cx, y: info.ground - info.Hp * 0.5 }
        : { x: r.left + r.width / 2, y: r.top + r.height / 2 };

      detailManager.open(index, origin, () => {
        stage.style.visibility = "hidden";
        stage.inert = true;
        fxManager.stop();
      });
    }, 2.5);
  }

  function closeDetailView() {
    carousel.mode = "closing";
    fxManager.stop();

    stage.style.visibility = "visible";
    stage.inert = false;

    carousel.getCards().forEach((c) => {
      const fr = c.querySelector(".fruit");
      if (fr) gsap.set(fr, { clearProps: "all" });
    });
    gsap.killTweensOf(carousel.getCards());
    gsap.set(root.querySelectorAll(".hudfade"), { clearProps: "all" });

    carousel.render();
    carousel.applyTheme();
    carousel.getActiveSpinner()?.draw();

    const card = carousel.getActiveCard();
    const r = card?.getBoundingClientRect() || {
      left: window.innerWidth / 2,
      top: window.innerHeight / 2,
      width: 0,
      height: 0,
    };
    const ox = r.left + r.width / 2;
    const oy = r.top + r.height / 2;

    detailManager.close({ x: ox, y: oy }, () => {
      carousel.mode = "browse";
    });
  }

  const handleResize = () => {
    fxManager.sizeCanvas();
    if (carousel.mode === "browse") {
      carousel.render();
    }
  };
  window.addEventListener("resize", handleResize);

  // Check initial hash (e.g. #spinach or #lemon) to center carousel
  const initialHash = window.location.hash.slice(1);
  const hashIdx = products.findIndex((p) => p.id === initialHash || p.slug === initialHash);
  if (hashIdx >= 0) {
    carousel.active = hashIdx;
    carousel.st.pos = hashIdx;
    carousel.render();
    carousel.applyTheme();
  }

  const isReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!isReducedMotion) {
      const fruitEls = carousel
        .getCards()
        .map((c) => c.querySelector(".fruit"))
        .filter(Boolean);
      gsap.from(fruitEls, {
        y: 90,
        opacity: 0,
        duration: 1.1,
        stagger: 0.07,
        ease: "power3.out",
        delay: 0.15,
        clearProps: "all",
      });
      gsap.from([nameEl, subEl, root.querySelector("#ghost")], {
        opacity: 0,
        y: 20,
        duration: 0.9,
        delay: 0.5,
        ease: "power3.out",
        clearProps: "all",
      });
  }

  // Return teardown function for astro:before-swap
  return () => {
    window.removeEventListener("resize", handleResize);
    carousel.destroy();
    detailManager.destroy();
    fxManager.stop();
  };
}
