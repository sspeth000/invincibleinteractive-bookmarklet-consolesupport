(() => {
  const ID = "ii-flight-sandbox";
  if (document.getElementById(ID)) {
    document.getElementById(ID).remove();
    return;
  }

  const root = document.createElement("div");
  root.id = ID;
  Object.assign(root.style, {
    position: "fixed", inset: "0", zIndex: "2147483647",
    background: "#72c8f2", overflow: "hidden", cursor: "crosshair"
  });

  const canvas = document.createElement("canvas");
  Object.assign(canvas.style, {width:"100%",height:"100%",display:"block"});
  root.appendChild(canvas);

  const hud = document.createElement("div");
  hud.textContent = "2D FLIGHT · WASD / arrows: fly · Shift: boost · Esc: close";
  Object.assign(hud.style, {
    position:"absolute", top:"12px", left:"12px", padding:"10px 14px",
    color:"white", background:"#101827d9", border:"1px solid #ffffff44",
    borderRadius:"8px", font:"13px system-ui,sans-serif", pointerEvents:"none"
  });
  root.appendChild(hud);
  document.body.appendChild(root);

  const ctx = canvas.getContext("2d");
  let w=0,h=0, raf=0, last=performance.now();
  const keys = new Set();
  const hero = {x:0,y:0,vx:0,vy:0,facing:1};
  const camera = {x:0,y:0};
  const heroImage = new Image();
  heroImage.crossOrigin = "anonymous";
  heroImage.src = "https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.png";
  const buildings = Array.from({length:100},(_,i)=>({
    x:i*150-1000,width:70+Math.random()*70,height:100+Math.random()*360
  }));

  function resize(){ const d=Math.min(devicePixelRatio||1,2); w=innerWidth;h=innerHeight;canvas.width=w*d;canvas.height=h*d;ctx.setTransform(d,0,0,d,0,0); }
  resize();
  const onResize=()=>resize();
  const down=e=>{keys.add(e.key.toLowerCase()); if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(e.key.toLowerCase()))e.preventDefault();};
  const up=e=>keys.delete(e.key.toLowerCase());
  const close=()=>{cancelAnimationFrame(raf);removeEventListener("resize",onResize);removeEventListener("keydown",down);removeEventListener("keyup",up);root.remove();};
  addEventListener("resize",onResize);addEventListener("keydown",down);addEventListener("keyup",up);
  function tick(now){
    const dt=Math.min((now-last)/1000,.033);last=now;
    if(keys.has("escape")){close();return;}
    let dx=0,dy=0;
    if(keys.has("a")||keys.has("arrowleft"))dx--;
    if(keys.has("d")||keys.has("arrowright"))dx++;
    if(keys.has("w")||keys.has("arrowup"))dy--;
    if(keys.has("s")||keys.has("arrowdown"))dy++;
    if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2;}
    const boost=keys.has("shift")?2.1:1, accel=850*boost, max=400*boost;
    hero.vx+=dx*accel*dt;hero.vy+=dy*accel*dt;
    const drag=Math.pow(.88,dt*60);hero.vx*=drag;hero.vy*=drag;
    hero.vx=Math.max(-max,Math.min(max,hero.vx));hero.vy=Math.max(-max,Math.min(max,hero.vy));
    hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;
    if(hero.vx>8)hero.facing=1;if(hero.vx< -8)hero.facing=-1;
    camera.x+=(hero.x-camera.x)*Math.min(1,dt*5);camera.y+=(hero.y-camera.y)*Math.min(1,dt*5);
    draw();raf=requestAnimationFrame(tick);
  }
  function draw(){
    const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#48aee9");sky.addColorStop(1,"#d8f4ff");ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);
    ctx.fillStyle="#ffffffaa";
    for(let i=0;i<10;i++){let x=((i*270-camera.x*.2)%(w+220));if(x< -110)x+=w+220;let y=70+(i%4)*90-camera.y*.08;ctx.beginPath();ctx.ellipse(x,y,48,15,0,0,Math.PI*2);ctx.ellipse(x+30,y-9,30,20,0,0,Math.PI*2);ctx.ellipse(x+58,y,38,14,0,0,Math.PI*2);ctx.fill();}
    ctx.fillStyle="#648da5";
    for(const b of buildings){const x=b.x-camera.x*.55,y=h-b.height+camera.y*.12;if(x+b.width>0&&x<w)ctx.fillRect(x,y,b.width,b.height);}
    const ground=h-28+camera.y*.2;ctx.fillStyle="#38834d";ctx.fillRect(0,ground,w,h-ground);ctx.fillStyle="#28633b";ctx.fillRect(0,ground,w,6);
    ctx.save();ctx.translate(w/2,h/2);ctx.scale(hero.facing,1);
    // Use the repository's uploaded placeholder sprite, preserving its aspect ratio.
    if(heroImage.complete && heroImage.naturalWidth>0){
      const spriteH=112, spriteW=spriteH*(heroImage.naturalWidth/heroImage.naturalHeight);
      ctx.drawImage(heroImage,-spriteW/2,-spriteH/2,spriteW,spriteH);
    } else {
      // Visible fallback while the sprite loads or if the image request fails.
      ctx.fillStyle="#c52b35";ctx.beginPath();ctx.moveTo(-9,-12);ctx.lineTo(-30,8);ctx.lineTo(-22,29);ctx.lineTo(-7,14);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#152e68";ctx.lineWidth=9;ctx.lineCap="round";ctx.beginPath();ctx.moveTo(-5,13);ctx.lineTo(-12,28);ctx.moveTo(5,13);ctx.lineTo(12,28);ctx.stroke();
      ctx.fillStyle="#1769aa";ctx.fillRect(-11,-14,22,30);ctx.fillStyle="#f5d442";ctx.beginPath();ctx.moveTo(0,-7);ctx.lineTo(7,0);ctx.lineTo(0,7);ctx.lineTo(-7,0);ctx.closePath();ctx.fill();
      ctx.strokeStyle="#1769aa";ctx.lineWidth=8;ctx.beginPath();ctx.moveTo(-9,-8);ctx.lineTo(-22,1);ctx.moveTo(9,-8);ctx.lineTo(22,1);ctx.stroke();
      ctx.fillStyle="#f0bd91";ctx.beginPath();ctx.arc(0,-24,10,0,Math.PI*2);ctx.fill();ctx.fillStyle="#4b3025";ctx.beginPath();ctx.arc(0,-28,10,Math.PI,Math.PI*2);ctx.fill();
    }
    ctx.restore();
    ctx.fillStyle="#101827d9";ctx.fillRect(w-130,12,118,34);ctx.fillStyle="white";ctx.font="13px system-ui";ctx.fillText("Speed "+Math.round(Math.hypot(hero.vx,hero.vy)),w-118,34);
  }
  raf=requestAnimationFrame(tick);
})();