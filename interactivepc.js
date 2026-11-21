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
    filter: page.style.filter,
    scrollBehavior: document.documentElement.style.scrollBehavior
  };

  const root = document.createElement("div");
  root.id = ID;
  // Keep the overlay outside the page's CSS cascade.
  for (const [property, value] of Object.entries({
    position: "fixed", inset: "0", zIndex: "2147483647",
    pointerEvents: "none", overflow: "hidden",
    font: "bold 13px system-ui, sans-serif", color: "#fff",
    transition: "opacity 260ms ease",
    display: "block", visibility: "visible", opacity: "1",
    margin: "0", padding: "0", border: "0", background: "transparent"
  })) root.style.setProperty(property, value, "important");

  const shadow = root.attachShadow({ mode: "closed" });
  const shield = document.createElement("style");
  shield.textContent = [
    ":host { all: initial !important; color: #fff !important; font-family: system-ui, sans-serif !important; }",
    "*, *::before, *::after { box-sizing: border-box !important; animation: none !important; transition: none !important; text-transform: none !important; letter-spacing: normal !important; }",
    "#ii-hud, #ii-stats { color: #fff !important; -webkit-text-fill-color: #fff !important; text-shadow: 0 1px 2px #000 !important; }",
    "canvas { display: block !important; }",
    "button { appearance: none !important; -webkit-appearance: none !important; color: #fff !important; -webkit-text-fill-color: #fff !important; font-family: system-ui, sans-serif !important; line-height: normal !important; }"
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
  hud.id = "ii-hud";
  hud.textContent = "INVINCIBLE FLIGHT • WASD / Arrows to fly • Shift to boost • Esc to close";
  Object.assign(hud.style, {
    position: "absolute", top: "14px", left: "50%", transform: "translateX(-50%)",
    padding: "10px 14px", background: "linear-gradient(110deg, rgba(8,20,39,.96), rgba(16,42,70,.92))",
    border: "1px solid rgba(150,205,255,.42)", borderRadius: "12px",
    boxShadow: "0 5px 22px #0005", letterSpacing: "1px", textShadow: "0 1px 8px #78baff66",
    whiteSpace: "nowrap", maxWidth: "calc(100vw - 24px)",
    textAlign: "center", boxSizing: "border-box"
  });
  shadow.appendChild(hud);

  const stats = document.createElement("div");
  stats.id = "ii-stats";
  stats.textContent = "SPEED 0";
  Object.assign(stats.style, {
    position: "absolute", top: "62px", right: "14px",
    padding: "9px 12px",
    background: "linear-gradient(145deg, rgba(20,42,68,.94), rgba(5,13,25,.94))",
    border: "1px solid rgba(135,190,255,.38)", borderRadius: "10px",
    boxShadow: "0 5px 18px #0005", letterSpacing: ".8px",
    font: "800 12px/1.2 system-ui", transition: "border-color 160ms ease, box-shadow 160ms ease"
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
      this.image.crossOrigin = "anonymous";
      this.image.onload = () => this.draw(window.innerWidth || 1, window.innerHeight || 1);
      this.image.onerror = () => console.warn("[Invincible Flight] Could not load placeholder.webp");
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

  root.style.opacity = "0";
  (document.documentElement || page).appendChild(root);
  requestAnimationFrame(() => root.style.setProperty("opacity", "1", "important"));
  const player = new Player();
  let w = 1, h = 1, dpr = 1, raf = 0, last = performance.now(), closed = false;

  function resize() {
    w = window.innerWidth || 1;
    h = window.innerHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(w * dpr));
    canvas.height = Math.max(1, Math.round(h * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.clearRect(0, 0, w, h);
    player.draw(w, h);
  }
  function drawFlightEffects(now, boosting) {
    if (!boosting) return;
    const intensity = Math.min(player.speed / player.boostSpeed, 1);
    ctx.save();
    ctx.strokeStyle = "#d8efff";
    ctx.lineWidth = 1.5;
    ctx.globalAlpha = 0.10 + intensity * 0.16;
    for (let i = 0; i < 16; i++) {
      const angle = (i / 16) * Math.PI * 2 + now * 0.00008;
      const inner = Math.min(w, h) * (0.39 + ((i % 3) * 0.035));
      const outer = Math.min(w, h) * (0.47 + intensity * 0.10);
      ctx.beginPath();
      ctx.moveTo(w / 2 + Math.cos(angle) * inner, h / 2 + Math.sin(angle) * inner);
      ctx.lineTo(w / 2 + Math.cos(angle) * outer, h / 2 + Math.sin(angle) * outer);
      ctx.stroke();
    }
    ctx.restore();
  }

  function drawWindTrail() {
    const speed = player.speed;
    if (speed < 18) return;
    const magnitude = Math.hypot(player.vx, player.vy) || 1;
    const backX = -player.vx / magnitude;
    const backY = -player.vy / magnitude;
    const sideX = -backY;
    const sideY = backX;
    const strength = Math.min(speed / player.boostSpeed, 1);
    const characterSize = Math.min(128, Math.max(72, h * 0.16));
    const start = characterSize * 0.43;
    const length = 24 + strength * 94;
    ctx.save();
    ctx.lineCap = "round";
    ctx.globalCompositeOperation = "lighter";
    for (let i = 0; i < 9; i++) {
      const spread = (i - 4) / 4;
      const wave = Math.sin(performance.now() * 0.006 + i * 1.7);
      const side = spread * (7 + strength * 13) + wave * 3;
      const drift = (i % 3) * 7;
      const x1 = w / 2 + backX * (start + drift) + sideX * side;
      const y1 = h / 2 + backY * (start + drift) + sideY * side;
      const x2 = x1 + backX * (length * (0.65 + (i % 4) * 0.12));
      const y2 = y1 + backY * (length * (0.65 + (i % 4) * 0.12));
      ctx.beginPath();
      ctx.strokeStyle = i % 3 === 0 ? "#ffffff" : "#9bdcff";
      ctx.lineWidth = i % 3 === 0 ? 2 : 1.2;
      ctx.globalAlpha = (0.12 + strength * 0.28) * (1 - Math.abs(spread) * 0.42);
      ctx.moveTo(x1, y1);
      ctx.quadraticCurveTo(
        x1 + backX * length * 0.42 + sideX * wave * 5,
        y1 + backY * length * 0.42 + sideY * wave * 5,
        x2, y2
      );
      ctx.stroke();
    }
    ctx.restore();
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
    const blur = Math.min(player.speed / player.boostSpeed, 1) * 1.25;
    page.style.filter = (original.filter && original.filter !== "none" ? original.filter + " " : "") +
      (blur > 0.04 ? "blur(" + blur.toFixed(2) + "px)" : "");
    const boosting = keys.has("shift");
    stats.textContent = "FLIGHT  /  " + String(player.speed).padStart(3, "0") +
      (boosting ? "  •  BOOST" : "");
    stats.style.borderColor = boosting ? "rgba(255,190,110,.85)" : "rgba(135,190,255,.38)";
    stats.style.boxShadow = boosting ? "0 0 18px rgba(255,145,65,.28)" : "0 5px 18px #0005";
    ctx.clearRect(0, 0, w, h);
    drawWindTrail();
    player.draw(w, h);
    drawFlightEffects(now, boosting);
    raf = requestAnimationFrame(tick);
  }

  function showReopenButton() {
    const buttonId = "ii-flight-reopen";
    let button = document.getElementById(buttonId);

    // Reuse the same launcher every time instead of destroying it.
    // This keeps the reopen control available across repeated launch/close cycles.
    if (!button) {
      button = document.createElement("button");
      button.id = buttonId;
      button.type = "button";
      button.textContent = "✈";
      button.setAttribute("aria-label", "Reopen Flight");
      Object.assign(button.style, {
        position: "fixed", right: "6px",
        bottom: "6px",
        zIndex: "2147483647", display: "grid", placeItems: "center",
        visibility: "visible", opacity: "1", pointerEvents: "auto",
        width: "52px", height: "52px", minWidth: "52px", minHeight: "52px",
        padding: "0", border: "1px solid rgba(255,255,255,.38)",
        borderRadius: "50%", background: "linear-gradient(145deg, #2877c7, #10243d)",
        color: "#fff", boxShadow: "0 4px 16px rgba(0,0,0,.38), inset 0 1px 1px #ffffff55",
        font: "bold 27px/1 system-ui", textAlign: "center",
        cursor: "pointer", touchAction: "manipulation",
        WebkitAppearance: "none", appearance: "none",
        WebkitTapHighlightColor: "transparent"
      });
      for (const property of ["position", "right", "bottom", "z-index", "display", "visibility", "opacity", "pointer-events"]) {
        button.style.setProperty(property, button.style.getPropertyValue(property), "important");
      }
      button.addEventListener("click", async () => {
        button.disabled = true;
        button.textContent = "…";
        try {
          const response = await fetch("https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/configuration.js", { cache: "no-store" });
          if (!response.ok) throw new Error("HTTP " + response.status);
          const source = await response.text();
          const script = document.createElement("script");
          script.textContent = source + "\n//# sourceURL=https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/configuration.js";
          (document.head || document.documentElement).appendChild(script);
          // Keep the button in the DOM, hidden behind the configuration panel.
          button.disabled = false;
          button.textContent = "✈";
          button.style.setProperty("display", "none", "important");
        } catch (error) {
          button.disabled = false;
          button.textContent = "Retry Flight";
          console.error("[Invincible Flight] Could not reopen configuration:", error);
        }
      });
      (document.documentElement || document.body).appendChild(button);
    }

    button.disabled = false;
    button.textContent = "✈";
    button.style.setProperty("display", "block", "important");
    button.style.setProperty("visibility", "visible", "important");
    button.style.setProperty("pointer-events", "auto", "important");
  }  function cleanup() {
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
    page.style.filter = original.filter;
    document.documentElement.style.scrollBehavior = original.scrollBehavior;
    root.remove();
    showReopenButton();
  }
  root.__iiCleanup = cleanup;
  close.addEventListener("click", cleanup);
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(tick);
})();