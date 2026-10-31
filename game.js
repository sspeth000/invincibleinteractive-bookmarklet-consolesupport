(() => {
  "use strict";

  const ID = "ii-flight-sandbox";
  const existing = document.getElementById(ID);
  if (existing) { existing.remove(); return; }

  const page = document.body || document.documentElement;
  const originalTransform = page.style.transform;
  const originalTransformOrigin = page.style.transformOrigin;
  const originalWillChange = page.style.willChange;
  const originalScrollBehavior = document.documentElement.style.scrollBehavior;

  // The camera moves the page as one surface. The flight UI lives outside
  // that surface so it stays fixed while the world moves underneath it.
  const root = document.createElement("div");
  root.id = ID;
  Object.assign(root.style, {
    position: "fixed", inset: "0", width: "100vw", height: "100vh",
    height: "100dvh", overflow: "hidden", zIndex: "2147483647",
    background: "transparent", pointerEvents: "none", userSelect: "none",
    WebkitUserSelect: "none", fontFamily: "system-ui, sans-serif"
  });

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {
    position: "absolute", inset: "0", width: "100%", height: "100%",
    display: "block", pointerEvents: "none"
  });
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const makeButton = (label, style = {}) => {
    const b = document.createElement("button");
    b.type = "button";
    b.textContent = label;
    Object.assign(b.style, {
      boxSizing: "border-box", color: "#fff", border: "2px solid #ffffffaa",
      background: "rgba(10,24,45,.92)", borderRadius: "14px",
      font: "bold 22px system-ui", touchAction: "none",
      userSelect: "none", WebkitUserSelect: "none", pointerEvents: "auto",
      ...style
    });
    return b;
  };

  const hud = document.createElement("div");
  hud.textContent = "INVINCIBLE FLIGHT • Hold controls to fly";
  Object.assign(hud.style, {
    position: "absolute", top: "max(10px, env(safe-area-inset-top))",
    left: "10px", right: "62px", padding: "10px 12px",
    borderRadius: "12px", background: "rgba(8,20,39,.9)",
    border: "1px solid #ffffff88", color: "#fff", font: "bold 13px system-ui",
    textAlign: "center", pointerEvents: "none", boxSizing: "border-box"
  });
  root.appendChild(hud);

  const stats = document.createElement("div");
  Object.assign(stats.style, {
    position: "absolute", right: "10px", top: "62px", padding: "7px 10px",
    background: "#101827dd", color: "#fff", borderRadius: "9px",
    font: "bold 12px system-ui", pointerEvents: "none"
  });
  stats.textContent = "SPEED 0";
  root.appendChild(stats);

  const close = makeButton("×", {
    position: "absolute", top: "max(8px, env(safe-area-inset-top))",
    right: "8px", width: "46px", height: "46px", fontSize: "24px",
    touchAction: "manipulation"
  });
  root.appendChild(close);

  const active = new Set();
  function bindHold(button, key) {
    const down = e => {
      e.preventDefault();
      active.add(key);
      button.style.background = "rgba(42,100,160,.98)";
      try { button.setPointerCapture(e.pointerId); } catch (_) {}
    };
    const up = e => {
      if (e) e.preventDefault();
      active.delete(key);
      button.style.background = key === "boost" ? "#9b252b" : "rgba(10,24,45,.92)";
    };
    button.addEventListener("pointerdown", down);
    ["pointerup", "pointercancel", "lostpointercapture"].forEach(t => button.addEventListener(t, up));
    button.addEventListener("contextmenu", e => e.preventDefault());
  }

  const pad = document.createElement("div");
  Object.assign(pad.style, {
    position: "absolute", left: "14px",
    bottom: "max(16px, env(safe-area-inset-bottom))",
    width: "min(42vw, 174px)", height: "min(42vw, 174px)",
    minWidth: "140px", minHeight: "140px", display: "grid",
    gridTemplateColumns: "repeat(3, 1fr)", gridTemplateRows: "repeat(3, 1fr)", gap: "5px"
  });
  function addDirection(label, key, row, col) {
    const b = makeButton(label, { gridRow: String(row), gridColumn: String(col), width: "100%", height: "100%", padding: "0" });
    bindHold(b, key);
    pad.appendChild(b);
  }
  addDirection("▲", "up", 1, 2);
  addDirection("◀", "left", 2, 1);
  addDirection("▶", "right", 2, 3);
  addDirection("▼", "down", 3, 2);
  root.appendChild(pad);

  const boost = makeButton("BOOST", {
    position: "absolute", right: "16px", bottom: "max(25px, env(safe-area-inset-bottom))",
    width: "clamp(82px, 24vw, 112px)", height: "clamp(64px, 18vw, 82px)",
    borderRadius: "17px", background: "#9b252b", font: "900 15px system-ui", letterSpacing: "1px"
  });
  bindHold(boost, "boost");
  root.appendChild(boost);

  // Append to <html>, not <body>, so a transformed page body won't carry the HUD.
  (document.documentElement || page).appendChild(root);

  let width = 1, height = 1, dpr = 1, raf = 0, lastTime = performance.now(), closed = false;
  const player = { x: 0, y: 0, vx: 0, vy: 0 };

  function resize() {
    width = window.innerWidth || 1;
    height = window.innerHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  const heroImage = new Image();
  heroImage.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.webp";

  function draw() {
    ctx.clearRect(0, 0, width, height);
    ctx.save();
    ctx.translate(width / 2, height / 2);
    if (heroImage.complete && heroImage.naturalWidth) {
      const sh = Math.min(128, Math.max(72, height * 0.16));
      const sw = sh * heroImage.naturalWidth / heroImage.naturalHeight;
      ctx.drawImage(heroImage, -sw / 2, -sh / 2, sw, sh);
    } else {
      ctx.fillStyle = "#155da4";
      ctx.fillRect(-12, -15, 24, 34);
      ctx.fillStyle = "#e9b991";
      ctx.beginPath(); ctx.arc(0, -25, 10, 0, Math.PI * 2); ctx.fill();
      ctx.fillStyle = "#c52d37";
      ctx.beginPath(); ctx.moveTo(-10, -12); ctx.lineTo(-29, 5); ctx.lineTo(-22, 27); ctx.lineTo(-8, 12); ctx.closePath(); ctx.fill();
    }
    ctx.restore();
  }

  function tick(now) {
    if (closed) return;
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.032);
    lastTime = now;
    let dx = Number(active.has("right")) - Number(active.has("left"));
    let dy = Number(active.has("down")) - Number(active.has("up"));
    if (dx && dy) { dx *= Math.SQRT1_2; dy *= Math.SQRT1_2; }

    const maxSpeed = active.has("boost") ? 520 : 260;
    const acceleration = 900;
    player.vx += dx * acceleration * dt;
    player.vy += dy * acceleration * dt;
    const drag = Math.pow(0.90, dt * 60);
    player.vx *= drag; player.vy *= drag;
    player.vx = Math.max(-maxSpeed, Math.min(maxSpeed, player.vx));
    player.vy = Math.max(-maxSpeed, Math.min(maxSpeed, player.vy));
    player.x += player.vx * dt;
    player.y += player.vy * dt;

    // Move the complete page opposite the player's direction.
    page.style.transformOrigin = "0 0";
    page.style.willChange = "transform";
    page.style.transform = "translate3d(" + (-player.x) + "px," + (-player.y) + "px,0)";

    stats.textContent = "SPEED " + Math.round(Math.hypot(player.vx, player.vy)) + (active.has("boost") ? "  BOOST" : "");
    draw();
    raf = requestAnimationFrame(tick);
  }

  function closeGame() {
    if (closed) return;
    closed = true;
    cancelAnimationFrame(raf);
    window.removeEventListener("resize", resize);
    active.clear();
    page.style.transform = originalTransform;
    page.style.transformOrigin = originalTransformOrigin;
    page.style.willChange = originalWillChange;
    document.documentElement.style.scrollBehavior = originalScrollBehavior;
    root.remove();
  }

  close.addEventListener("click", closeGame);
  window.addEventListener("resize", resize);
  resize();
  raf = requestAnimationFrame(tick);
})();