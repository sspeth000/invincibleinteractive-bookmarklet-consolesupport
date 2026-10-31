(() => {
  "use strict";
  const ID = "ii-flight-sandbox";
  const previous = document.getElementById(ID);
  if (previous) { previous.remove(); return; }

  // Virtual camera: shift page-level elements without changing native scroll.
  const html = document.documentElement;
  const body = document.body || html;
  const movedElements = new Map();
  function trackPageElement(el) {
    if (!el || el.id === ID || el.hasAttribute("data-ii-flight-ignore") || movedElements.has(el)) return;
    movedElements.set(el, el.style.translate || "");
  }
  Array.from(body.children).forEach(trackPageElement);
  const pageObserver = new MutationObserver(records => {
    for (const record of records) {
      for (const node of record.addedNodes) {
        if (node.nodeType === 1) trackPageElement(node);
      }
    }
  });
  pageObserver.observe(body, { childList: true });
  function movePage(dx, dy) {
    for (const [el] of movedElements) {
      if (el.isConnected) {
        const original = movedElements.get(el);
        el.style.translate = (original ? original + " " : "") + dx + "px " + dy + "px";
      }
    }
  }

  // Set a mobile-friendly layout viewport, restoring the original on close.
  const viewportMeta = document.querySelector('meta[name="viewport"]');
  const oldViewportContent = viewportMeta ? viewportMeta.getAttribute("content") : null;
  let addedViewportMeta = false;
  const viewport = viewportMeta || document.createElement("meta");
  if (!viewportMeta) {
    viewport.name = "viewport";
    document.head.appendChild(viewport);
    addedViewportMeta = true;
  }
  viewport.setAttribute("content", "width=device-width, initial-scale=1, viewport-fit=cover");

  const root = document.createElement("div");
  root.id = ID;
  Object.assign(root.style, {
    position:"fixed", inset:"0", width:"100vw", height:"100dvh",
    overflow:"hidden", zIndex:"2147483647", background:"transparent", pointerEvents:"none",
    touchAction:"auto", userSelect:"none", WebkitUserSelect:"none",
    fontFamily:"system-ui,-apple-system,sans-serif"
  });

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style,{position:"absolute",inset:"0",width:"100%",height:"100%",display:"block",touchAction:"auto",pointerEvents:"none"});
  root.appendChild(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) { alert("This browser could not create the game canvas."); return; }

  const hud = document.createElement("div");
  hud.textContent = "INVINCIBLE FLIGHT  •  Hold controls to fly";
  Object.assign(hud.style,{
    position:"absolute",top:"max(10px,env(safe-area-inset-top))",left:"10px",right:"62px",
    padding:"10px 12px",borderRadius:"12px",background:"rgba(8,20,39,.9)",
    border:"1px solid #ffffff88",color:"#fff",font:"bold 13px system-ui",
    textAlign:"center",pointerEvents:"none",zIndex:"3",boxSizing:"border-box"
  });
  root.appendChild(hud);

  const close = document.createElement("button");
  close.textContent="✕";
  Object.assign(close.style,{
    position:"absolute",top:"max(8px,env(safe-area-inset-top))",right:"8px",
    width:"46px",height:"46px",borderRadius:"12px",border:"1px solid #ffffff99",
    background:"#111d32",color:"#fff",font:"bold 22px system-ui",zIndex:"5",
    touchAction:"manipulation",pointerEvents:"auto"
  });
  root.appendChild(close);

  const active = new Set();
  const controlStyle = {
    border:"2px solid rgba(255,255,255,.75)",borderRadius:"15px",
    background:"rgba(10,24,45,.88)",color:"#fff",font:"bold 25px system-ui",
    touchAction:"none",userSelect:"none",WebkitUserSelect:"none",
    display:"flex",alignItems:"center",justifyContent:"center",padding:"0",pointerEvents:"auto"
  };
  const pad = document.createElement("div");
  Object.assign(pad.style,{
    position:"absolute",left:"14px",bottom:"max(16px,env(safe-area-inset-bottom))",
    width:"min(42vw,174px)",height:"min(42vw,174px)",minWidth:"140px",minHeight:"140px",
    display:"grid",gridTemplateColumns:"repeat(3,1fr)",gridTemplateRows:"repeat(3,1fr)",
    gap:"5px",zIndex:"4"
  });
  function control(label, key, row, col) {
    const b=document.createElement("button");
    b.textContent=label;
    Object.assign(b.style,controlStyle,{gridRow:String(row),gridColumn:String(col)});
    const press=e=>{e.preventDefault();active.add(key);b.style.background="rgba(42,100,160,.98)";};
    const release=e=>{if(e)e.preventDefault();active.delete(key);b.style.background="rgba(10,24,45,.88)";};
    b.addEventListener("pointerdown",press);
    ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(type=>b.addEventListener(type,release));
    b.addEventListener("touchstart",press,{passive:false});
    ["touchend","touchcancel"].forEach(type=>b.addEventListener(type,release,{passive:false}));
    pad.appendChild(b);
  }
  control("▲","up",1,2); control("◀","left",2,1); control("▶","right",2,3); control("▼","down",3,2);
  root.appendChild(pad);

  const boost=document.createElement("button");
  boost.textContent="BOOST";
  Object.assign(boost.style,{
    position:"absolute",right:"16px",bottom:"max(25px,env(safe-area-inset-bottom))",
    width:"clamp(82px,24vw,112px)",height:"clamp(64px,18vw,82px)",
    border:"2px solid #ffffffaa",borderRadius:"17px",background:"#9b252b",
    color:"#fff",font:"900 15px system-ui",letterSpacing:"1px",zIndex:"4",touchAction:"none",pointerEvents:"auto"
  });
  const boostOn=e=>{e.preventDefault();active.add("boost");boost.style.background="#d83a42";};
  const boostOff=e=>{if(e)e.preventDefault();active.delete("boost");boost.style.background="#9b252b";};
  boost.addEventListener("pointerdown",boostOn);
  ["pointerup","pointercancel","pointerleave","lostpointercapture"].forEach(t=>boost.addEventListener(t,boostOff));
  boost.addEventListener("touchstart",boostOn,{passive:false});
  ["touchend","touchcancel"].forEach(t=>boost.addEventListener(t,boostOff,{passive:false}));
  root.appendChild(boost);

  const stats=document.createElement("div");
  Object.assign(stats.style,{
    position:"absolute",right:"10px",top:"62px",padding:"7px 10px",
    background:"#101827dd",color:"#fff",borderRadius:"9px",font:"bold 12px system-ui",
    zIndex:"3",pointerEvents:"none"
  });
  stats.textContent="SPEED 0";
  root.appendChild(stats);

  (document.body||document.documentElement).appendChild(root);

  let width=0,height=0,dpr=1,frame=0,last=performance.now(),closed=false;
  const player={x:0,y:0,vx:0,vy:0};
  const camera={x:0,y:0};
  const clouds=Array.from({length:16},(_,i)=>({x:i*260,y:55+(i%5)*85,r:30+(i%3)*12}));
  const buildings=Array.from({length:90},(_,i)=>({x:i*145-500,height:80+(i*73)%260,width:70+(i*29)%65}));
  function resize(){
    width=window.innerWidth;height=window.innerHeight;dpr=Math.min(window.devicePixelRatio||1,2);
    canvas.width=Math.max(1,Math.round(width*dpr));canvas.height=Math.max(1,Math.round(height*dpr));
    ctx.setTransform(dpr,0,0,dpr,0,0);
  }
  function closeGame(){
    if(closed)return;closed=true;cancelAnimationFrame(frame);
    window.removeEventListener("resize",resize);
    pageObserver.disconnect();
    active.clear();
    for (const [el, originalTranslate] of movedElements) {
      if (el.isConnected) el.style.translate = originalTranslate;
    }
    root.remove();
    if (addedViewportMeta) viewport.remove();\n    else if (oldViewportContent !== null) viewport.setAttribute("content",oldViewportContent);
  }
  close.addEventListener("click",closeGame);
  window.addEventListener("resize",resize);
  resize();

  const heroImage = new Image();
  heroImage.alt = "Flying hero";
  heroImage.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.webp";
  function draw(){
    // Transparent overlay: show the actual webpage behind the hero.
    ctx.clearRect(0,0,width,height);
    ctx.save();ctx.translate(width*.5,height*.5);
    if (heroImage.complete && heroImage.naturalWidth > 0) {
      const spriteH = Math.min(128, Math.max(72, height * 0.16));
      const spriteW = spriteH * heroImage.naturalWidth / heroImage.naturalHeight;
      ctx.drawImage(heroImage, -spriteW/2, -spriteH/2, spriteW, spriteH);
      ctx.restore();return;
    }
    const angle=Math.atan2(player.vy,Math.max(1,Math.abs(player.vx)))*.45;
    ctx.rotate(angle);ctx.lineCap="round";ctx.lineJoin="round";
    ctx.strokeStyle="#155da4";ctx.lineWidth=10;
    ctx.beginPath();ctx.moveTo(-7,12);ctx.lineTo(-13,29);ctx.moveTo(7,12);ctx.lineTo(13,29);ctx.stroke();
    ctx.fillStyle="#155da4";ctx.fillRect(-12,-13,24,30);
    ctx.fillStyle="#e4c83d";ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(7,0);ctx.lineTo(0,7);ctx.lineTo(-7,0);ctx.closePath();ctx.fill();
    ctx.strokeStyle="#155da4";ctx.lineWidth=9;ctx.beginPath();ctx.moveTo(-10,-7);ctx.lineTo(-24,2);ctx.moveTo(10,-7);ctx.lineTo(24,2);ctx.stroke();
    ctx.fillStyle="#e9b991";ctx.beginPath();ctx.arc(0,-24,10,0,Math.PI*2);ctx.fill();
    ctx.fillStyle="#493126";ctx.beginPath();ctx.arc(0,-28,10,Math.PI,Math.PI*2);ctx.fill();
    ctx.fillStyle="#c52d37";ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(-30,5);ctx.lineTo(-24,27);ctx.lineTo(-8,12);ctx.closePath();ctx.fill();
    ctx.restore();
  }

  function tick(now){
    if(closed)return;
    const dt=Math.min((now-last)/1000,.032);last=now;
    let dx=(active.has("right")?1:0)-(active.has("left")?1:0);
    let dy=(active.has("up")?1:0)-(active.has("down")?1:0);
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}
    const maxSpeed=active.has("boost")?900:450;
    player.vx+=dx*1500*dt;player.vy+=dy*1500*dt;
    const drag=Math.pow(.97,dt*60);player.vx*=drag;player.vy*=drag;
    player.vx=Math.max(-maxSpeed,Math.min(maxSpeed,player.vx));
    player.vy=Math.max(-maxSpeed,Math.min(maxSpeed,player.vy));
    player.x+=player.vx*dt;player.y+=player.vy*dt;

    // Shift the webpage opposite the hero's travel, like a camera following it.
    movePage(-player.x, -player.y);

    camera.x+=(player.x-camera.x)*Math.min(1,dt*4.5);
    camera.y+=(player.y-camera.y)*Math.min(1,dt*4.5);
    stats.textContent="SPEED "+Math.round(Math.hypot(player.vx,player.vy))+(active.has("boost")?"  BOOST":"");
    draw();frame=requestAnimationFrame(tick);
  }
  frame=requestAnimationFrame(tick);
})();