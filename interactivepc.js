(() => {
  "use strict";

  // PC controls for Invincible Interactive Flight.
  // Uses the same flight model and assets as interactivemobile.js.
  const ID = "ii-flight-pc";
  const previous = document.getElementById(ID);
  if (previous) {
    previous.__iiCleanup?.();
    return;
  }

  const page = document.body || document.documentElement;
  const original = {
    transform: page.style.transform,
    transformOrigin: page.style.transformOrigin,
    willChange: page.style.willChange,
    scrollBehavior: document.documentElement.style.scrollBehavior
  };

  const root = document.createElement("div");
  root.id = ID;
  // Keep the overlay outside the page's CSS cascade.
  for (const [property, value] of Object.entries({
    position: "fixed", inset: "0", zIndex: "2147483647",
    pointerEvents: "none", overflow: "hidden",
    font: "bold 13px system-ui, sans-serif", color: "#fff",
    display: "block", visibility: "visible", opacity: "1",
    margin: "0", padding: "0", border: "0", background: "transparent"
  })) root.style.setProperty(property, value, "important");

  const shadow = root.attachShadow({ mode: "closed" });
  const shield = document.createElement("style");
  shield.textContent = [
    ":host { all: initial !important; }",
    "*, *::before, *::after { box-sizing: border-box !important; animation: none !important; transition: none !important; text-transform: none !important; letter-spacing: normal !important; }",
    "canvas { display: block !important; }",
    "button { appearance: none !important; -webkit-appearance: none !important; font-family: system-ui, sans-serif !important; line-height: normal !important; }"
  ].join("\\n");
  shadow.appendChild(shield);

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%",
    pointerEvents: "none"
  });
  shadow.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) throw new Error("Canvas 2D is unavailable");

  const hud = document.createElement("div");
  hud.textContent = "INVINCIBLE FLIGHT • WASD / Arrows to fly • Shift to boost • Esc to close";
  Object.assign(hud.style, {
    position: "absolute", top: "14px", left: "50%", transform: "translateX(-50%)",
    padding: "10px 14px", background: "#081427eF",
    border: "1px solid #ffffff88", borderRadius: "10px",
    whiteSpace: "nowrap", maxWidth: "calc(100vw - 24px)",
    textAlign: "center", boxSizing: "border-box"
  });
  shadow.appendChild(hud);

  const stats = document.createElement("div");
  stats.textContent = "SPEED 0";
  Object.assign(stats.style, {
    position: "absolute", top: "62px", right: "14px",
    padding: "8px 10px", background: "#101827dd", borderRadius: "8px"
  });
  shadow.appendChild(stats);

  const close = document.createElement("button");
  close.textContent = "×";
  close.title = "Close flight (Esc)";
  Object.assign(close.style, {
    position: "absolute", top: "12px", right: "12px",
    width: "38px", height: "38px", pointerEvents: "auto",
    color: "#fff", background: "#8f2028", border: "1px solid #ffffff88",
    borderRadius: "8px", font: "bold 24px system-ui", cursor: "pointer"
  });
  shadow.appendChild(close);

  class Player {
    constructor() {
      this.x = this.y = this.vx = this.vy = this.lean = 0;
      this.acceleration = 1800;
      this.braking = 1400;
      this.normalSpeed = 260;
      this.boostSpeed = 520;
      this.leanSmoothing = 9;
      this.maxLean = 0.38;
      this.image = new Image();
      this.image.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.webp";
    }
    get speed() { return Math.round(Math.hypot(this.vx, this.vy)); }
    update(ix, iy, boosting, dt) {
      const max = boosting ? this.boostSpeed : this.normalSpeed;
      const tx = ix * max, ty = iy * max;
      const move = (v, target, amount) => v < target
        ? Math.min(v + amount, target)
        : v > target ? Math.max(v - amount, target) : target;
      const rate = (ix || iy) ? this.acceleration : this.braking;
      this.vx = move(this.vx, tx, rate * dt);
      this.vy = move(this.vy, ty, rate * dt);
      this.x += this.vx * dt;
      this.y += this.vy * dt;
      const targetLean = Math.max(-this.maxLean, Math.min(this.maxLean,
        (this.vx / max) * this.maxLean + (this.vy / max) * this.maxLean * 0.22));
      this.lean += (targetLean - this.lean) * (1 - Math.exp(-this.leanSmoothing * dt));
    }
    draw(w, h) {
      ctx.clearRect(0, 0, w, h);
      ctx.save();
      ctx.translate(w / 2, h / 2);
      ctx.rotate(this.lean);
      if (this.image.complete && this.image.naturalWidth) {
        const ih = Math.min(128, Math.max(72, h * 0.16));
        const iw = ih * this.image.naturalWidth / this.image.naturalHeight;
        ctx.drawImage(this.image, -iw / 2, -ih / 2, iw, ih);
      } else {
        ctx.fillStyle = "#155da4"; ctx.fillRect(-12, -15, 24, 34);
        ctx.fillStyle = "#e9b991"; ctx.beginPath(); ctx.arc(0, -25, 10, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = "#c52d37"; ctx.beginPath();
        ctx.moveTo(-10, -12); ctx.lineTo(-29, 5); ctx.lineTo(-22, 27);
        ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill();
      }
      ctx.restore();
    }
  }

  const keys = new Set();
  const down = e => {
    const key = e.key.toLowerCase();
    if (["w", "a", "s", "d", "arrowup", "arrowdown", "arrowleft", "arrowright", "shift", "escape"].includes(key)) {
      e.preventDefault();
      if (key === "escape") cleanup();
      else keys.add(key);
    }
  };
  const up = e => keys.delete(e.key.toLowerCase());
  const blur = () => keys.clear();
  window.addEventListener("keydown", down);
  window.addEventListener("keyup", up);
  window.addEventListener("blur", blur);

  const music = new Audio("https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/musicfunk.mp3");
  music.loop = true;
  music.volume = 0.5;
  music.play().catch(() => {});

  (document.documentElement || page).appendChild(root);
  const player = new Player();
  let w = 1, h = 1, dpr = 1, raf = 0, last = performance.now(), closed = false;

  function resize() {
    w = window.innerWidth || 1;
    h = window.innerHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    player.draw(w, h);
  }
  function tick(now) {
    if (closed) return;
    const dt = Math.min(Math.max((now - last) / 1000, 0), 0.05);
    last = now;
    const ix = (keys.has("d") || keys.has("arrowright") ? 1 : 0) -
      (keys.has("a") || keys.has("arrowleft") ? 1 : 0);
    const iy = (keys.has("s") || keys.has("arrowdown") ? 1 : 0) -
      (keys.has("w") || keys.has("arrowup") ? 1 : 0);
    const length = Math.hypot(ix, iy) || 1;
    player.update(ix / length, iy / length, keys.has("shift"), dt);
    page.style.transformOrigin = "0 0";
    page.style.willChange = "transform";
    page.style.transform = "translate3d(" + (-player.x) + "px," + (-player.y) + "px,0)";
    stats.textContent = "SPEED " + player.speed + (keys.has("shift") ? " • BOOST ×2" : "");
    player.draw(w, h);
    raf = requestAnimationFrame(tick);
  }
  function cleanup() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("keydown", down);
    window.removeEventListener("keyup", up);
    window.removeEventListener("blur", blur);
    window.removeEventListener("resize", resize);
    keys.clear();
    music.pause();
    music.currentTime = 0;
    page.style.transform = original.transform;
    page.style.transformOrigin = original.transformOrigin;
    page.style.willChange = original.willChange;
    document.documentElement.style.scrollBehavior = original.scrollBehavior;
    root.remove();
  }
  root.__iiCleanup = cleanup;
  close.addEventListener("click", cleanup);
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(tick);
})();