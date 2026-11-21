(() => {
  "use strict";

  const BASE = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/";
  document.getElementById("ii-flight-reopen")?.remove();
  const ROOT_ID = "ii-flight-configuration";
  const old = document.getElementById(ROOT_ID);
  if (old) old.remove();

  const root = document.createElement("div");
  root.id = ROOT_ID;
  Object.assign(root.style, {
    position: "fixed", inset: "0", zIndex: "2147483647",
    display: "grid", placeItems: "center", padding: "20px",
    background: "rgba(3, 8, 18, .82)", backdropFilter: "blur(12px)",
    WebkitBackdropFilter: "blur(12px)", fontFamily: "system-ui, sans-serif",
    color: "#fff", boxSizing: "border-box"
  });

  const panel = document.createElement("section");
  Object.assign(panel.style, {
    width: "min(100%, 440px)", padding: "26px",
    border: "1px solid rgba(255,255,255,.16)", borderRadius: "22px",
    background: "linear-gradient(145deg, #14243b, #080f1c)",
    boxShadow: "0 24px 80px rgba(0,0,0,.5)", boxSizing: "border-box",
    textAlign: "center"
  });

  const eyebrow = document.createElement("div");
  eyebrow.textContent = "INVINCIBLE INTERACTIVE";
  Object.assign(eyebrow.style, {
    color: "#8bbcff", fontSize: "11px", fontWeight: "800",
    letterSpacing: "2px", marginBottom: "10px"
  });

  const heading = document.createElement("h1");
  heading.textContent = "Choose your controls";
  Object.assign(heading.style, {
    margin: "0 0 8px", fontSize: "clamp(24px, 6vw, 32px)",
    lineHeight: "1.15", color: "#fff"
  });

  const subtitle = document.createElement("p");
  subtitle.textContent = "Which version would you like to launch?";
  Object.assign(subtitle.style, {
    margin: "0 0 22px", color: "#b8c7da", fontSize: "14px"
  });

  const status = document.createElement("p");
  status.setAttribute("role", "status");
  status.textContent = "Select a version to continue.";
  Object.assign(status.style, {
    minHeight: "20px", margin: "18px 0 0",
    color: "#b8c7da", fontSize: "13px"
  });

  const makeChoice = (title, detail, symbol, file) => {
    const button = document.createElement("button");
    button.type = "button";
    Object.assign(button.style, {
      display: "flex", alignItems: "center", gap: "14px",
      width: "100%", padding: "17px", marginTop: "12px",
      textAlign: "left", border: "1px solid #ffffff24",
      borderRadius: "15px", background: "#ffffff0b",
      color: "#fff", cursor: "pointer", font: "inherit",
      touchAction: "manipulation"
    });

    const icon = document.createElement("span");
    icon.textContent = symbol;
    Object.assign(icon.style, {
      display: "grid", placeItems: "center", flex: "0 0 48px",
      width: "48px", height: "48px", borderRadius: "13px",
      background: "#397bd733", fontSize: "25px"
    });

    const copy = document.createElement("span");
    copy.style.display = "grid";
    copy.style.gap = "4px";
    const name = document.createElement("strong");
    name.textContent = title;
    name.style.fontSize = "17px";
    const description = document.createElement("small");
    description.textContent = detail;
    description.style.color = "#b8c7da";
    copy.append(name, description);
    const arrow = document.createElement("span");
    arrow.textContent = "›";
    Object.assign(arrow.style, { marginLeft: "auto", fontSize: "27px", color: "#8bbcff" });
    button.append(icon, copy, arrow);

    button.addEventListener("click", async () => {
      if (button.disabled) return;
      buttons.forEach(item => { item.disabled = true; item.style.opacity = ".55"; });
      status.textContent = "Loading " + title + " version…";
      try {
        const response = await fetch(BASE + file, { cache: "no-store" });
        if (!response.ok) throw new Error("HTTP " + response.status);
        const source = await response.text();
        if (!source.trim()) throw new Error("The script was empty.");
        const script = document.createElement("script");
        script.textContent = source + "\n//# sourceURL=" + BASE + file;
        (document.head || document.documentElement).appendChild(script);
        root.remove();
      } catch (error) {
        status.textContent = "Could not load " + file + ": " + error.message + ". Try again.";
        buttons.forEach(item => { item.disabled = false; item.style.opacity = "1"; });
      }
    });
    return button;
  };

  const buttons = [
    makeChoice("Mobile", "Touch joystick and boost button", "📱", "interactivemobile.js"),
    makeChoice("PC", "WASD / arrow keys and Shift boost", "💻", "interactivepc.js")
  ];

  const footer = document.createElement("div");
  footer.textContent = "You can close this panel and run the bookmarklet again to choose differently.";
  Object.assign(footer.style, {
    marginTop: "20px", color: "#8293aa", fontSize: "11px", lineHeight: "1.5"
  });

  panel.append(eyebrow, heading, subtitle, ...buttons, status, footer);
  root.appendChild(panel);
  (document.documentElement || document.body).appendChild(root);
})();