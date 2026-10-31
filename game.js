(() => {
  "use strict";
  const loader = document.createElement("script");
  loader.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/invincible.js";
  loader.onload = () => startFlightGame();
  loader.onerror = () => console.error("Could not load invincible.js");
  document.head.appendChild(loader);
  function startFlightGame() {
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

  // Analog thumbstick, styled after a familiar mobile game joystick.
  const pad = document.createElement("div");
  Object.assign(pad.style, {
    position: "absolute", left: "22px",
    bottom: "max(22px, env(safe-area-inset-bottom))",
    width: "min(38vw, 160px)", height: "min(38vw, 160px)",
    minWidth: "128px", minHeight: "128px", borderRadius: "50%",
    background: "rgba(18,32,52,.38)", border: "2px solid rgba(255,255,255,.48)",
    boxShadow: "inset 0 0 18px #0005", pointerEvents: "auto",
    touchAction: "none"
  });

  const knob = document.createElement("div");
  Object.assign(knob.style, {
    position: "absolute", left: "50%", top: "50%",
    width: "44%", height: "44%", borderRadius: "50%",
    transform: "translate(-50%, -50%)",
    background: "rgba(220,235,255,.78)", border: "2px solid #ffffffcc",
    boxShadow: "0 3px 10px #0006", pointerEvents: "none"
  });
  pad.appendChild(knob);
  root.appendChild(pad);

  let stickX = 0, stickY = 0, stickPointer = null;
  function updateStick(e) {
    const rect = pad.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const radius = Math.min(rect.width, rect.height) * 0.34;
    let x = (e.clientX - cx) / radius;
    let y = (e.clientY - cy) / radius;
    const magnitude = Math.hypot(x, y);
    if (magnitude > 1) { x /= magnitude; y /= magnitude; }
    // Small deadzone prevents accidental drift near the center.
    const deadzone = 0.12;
    const adjusted = Math.max(0, Math.hypot(x, y) - deadzone) / (1 - deadzone);
    if (magnitude > 0) {
      const normalized = Math.hypot(x, y);
      stickX = x / normalized * adjusted;
      stickY = y / normalized * adjusted;
    } else {
      stickX = 0;
      stickY = 0;
    }
    knob.style.left = (50 + stickX * 34) + "%";
    knob.style.top = (50 + stickY * 34) + "%";
  }
  function resetStick() {
    stickX = 0;
    stickY = 0;
    stickPointer = null;
    knob.style.left = "50%";
    knob.style.top = "50%";
  }
  pad.addEventListener("pointerdown", e => {
    e.preventDefault();
    if (stickPointer !== null) return;
    stickPointer = e.pointerId;
    try { pad.setPointerCapture(e.pointerId); } catch (_) {}
    updateStick(e);
  });
  pad.addEventListener("pointermove", e => {
    if (e.pointerId !== stickPointer) return;
    e.preventDefault();
    updateStick(e);
  });
  ["pointerup", "pointercancel", "lostpointercapture"].forEach(type => {
    pad.addEventListener(type, e => {
      if (e.pointerId === stickPointer) resetStick();
    });
  });

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
  const player = new window.InvinciblePlayer(ctx);

  function resize() {
    width = window.innerWidth || 1;
    height = window.innerHeight || 1;
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    canvas.width = Math.max(1, Math.round(width * dpr));
    canvas.height = Math.max(1, Math.round(height * dpr));
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw();
  }

  function draw() { player.draw(width, height); }

  function tick(now) {
    if (closed) return;
    const dt = Math.min(Math.max((now - lastTime) / 1000, 0), 0.05);
    lastTime = now;

    player.update(stickX, stickY, active.has("boost"), dt);

    page.style.transformOrigin = "0 0";
    page.style.willChange = "transform";
    page.style.transform = "translate3d(" + (-player.x) + "px," + (-player.y) + "px,0)";

    stats.textContent = "SPEED " + Math.round(player.speed) +
      (active.has("boost") ? "  BOOST ×2" : "");
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
  }
})();
