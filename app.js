// MobileDiffuser project page — small progressive enhancements, no dependencies.
(() => {
  const reduce = matchMedia("(prefers-reduced-motion: reduce)").matches;

  // Nav border on scroll
  const nav = document.getElementById("nav");
  const onScroll = () => nav.classList.toggle("is-scrolled", scrollY > 8);
  addEventListener("scroll", onScroll, { passive: true });
  onScroll();

  // Pipeline: Stage 0 + 24 block stages
  const blocks = document.getElementById("blocks");
  if (blocks) {
    for (let i = 0; i < 25; i++) {
      const el = document.createElement("i");
      el.style.setProperty("--i", i);
      blocks.appendChild(el);
    }
  }

  // Reveal on scroll (staggered inside grids)
  const reveals = [...document.querySelectorAll(".reveal")];
  reveals.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains("reveal"));
    el.style.setProperty("--d", `${Math.min(siblings.indexOf(el), 5) * 0.08}s`);
  });
  if ("IntersectionObserver" in window && !reduce) {
    const io = new IntersectionObserver((entries) => {
      entries.forEach((e) => {
        if (e.isIntersecting) {
          e.target.classList.add("is-in");
          io.unobserve(e.target);
        }
      });
    }, { threshold: 0.12, rootMargin: "0px 0px -6% 0px" });
    reveals.forEach((el) => io.observe(el));
  } else {
    reveals.forEach((el) => el.classList.add("is-in"));
  }

  // Count-up stats
  const counters = document.querySelectorAll("[data-count]");
  const runCount = (el) => {
    const target = parseFloat(el.dataset.count);
    const dec = parseInt(el.dataset.dec || "0", 10);
    if (reduce) { el.textContent = target.toFixed(dec); return; }
    const t0 = performance.now();
    const dur = 1100;
    const tick = (t) => {
      const p = Math.min((t - t0) / dur, 1);
      el.textContent = (target * (1 - Math.pow(1 - p, 3))).toFixed(dec);
      if (p < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  };
  if ("IntersectionObserver" in window) {
    const io2 = new IntersectionObserver((entries) => {
      entries.forEach((e) => { if (e.isIntersecting) { runCount(e.target); io2.unobserve(e.target); } });
    }, { threshold: 0.6 });
    counters.forEach((c) => io2.observe(c));
  }

  // ReSeed strength switch
  const captions = {
    "0": "Without ReSeed, four seeds give almost the same frontal portrait.",
    "10": "α = 1.0 — hair, appearance, expression and background now change with the seed.",
    "15": "α = 1.5 — even the framing varies: full-body shots and wider scenes appear.",
  };
  const grid = document.getElementById("reseedGrid");
  const caption = document.getElementById("reseedCaption");
  const tabs = [...document.querySelectorAll(".seg [data-alpha]")];
  ["10", "15"].forEach((a) => { for (let s = 1; s <= 4; s++) { new Image().src = `assets/reseed/a${a}_s${s}.webp`; } });
  const select = (btn) => {
    const a = btn.dataset.alpha;
    tabs.forEach((t) => t.setAttribute("aria-selected", String(t === btn)));
    grid.classList.add("is-swapping");
    setTimeout(() => {
      grid.querySelectorAll("img").forEach((img, i) => { img.src = `assets/reseed/a${a}_s${i + 1}.webp`; });
      caption.textContent = captions[a];
      grid.classList.remove("is-swapping");
    }, reduce ? 0 : 220);
  };
  tabs.forEach((btn, i) => {
    btn.addEventListener("click", () => select(btn));
    btn.addEventListener("keydown", (e) => {
      if (e.key !== "ArrowRight" && e.key !== "ArrowLeft") return;
      const next = tabs[(i + (e.key === "ArrowRight" ? 1 : tabs.length - 1)) % tabs.length];
      next.focus();
      select(next);
    });
  });

  // Copy buttons
  document.querySelectorAll(".copy").forEach((btn) => {
    btn.addEventListener("click", async () => {
      const text = document.querySelector(btn.dataset.copy).innerText;
      try {
        await navigator.clipboard.writeText(text);
        btn.textContent = "Copied";
      } catch {
        btn.textContent = "Select & copy";
      }
      setTimeout(() => { btn.textContent = "Copy"; }, 1600);
    });
  });
})();
