(() => {
  const ID = "ii-flight-sandbox";
  try {
    const existing = document.getElementById(ID);
    if (existing) { existing.remove(); return; }

    const root = document.createElement("div");
    root.id = ID;
    Object.assign(root.style, {
      position:"fixed", inset:"0", zIndex:"2147483647",
      background:"#72c8f2", overflow:"hidden", cursor:"crosshair",
      touchAction:"none", userSelect:"none", WebkitUserSelect:"none"
    });

    const canvas = document.createElement("canvas");
    Object.assign(canvas.style, {width:"100%",height:"100%",display:"block",touchAction:"none"});
    root.appendChild(canvas);

    const isTouch = ("ontouchstart" in window) || navigator.maxTouchPoints > 0;
    const hud = document.createElement("div");
    hud.textContent = isTouch ? "2D FLIGHT · Touch controls · Boost · Close" : "2D FLIGHT · WASD / arrows: fly · Shift: boost · Esc: close";
    Object.assign(hud.style, {
      position:"absolute",top:"12px",left:"12px",padding:"10px 14px",
      color:"white",background:"#101827d9",border:"1px solid #ffffff44",
      borderRadius:"8px",font:"13px system-ui,sans-serif",pointerEvents:"none",
      maxWidth:"calc(100% - 150px)"
    });
    root.appendChild(hud);

    const closeButton = document.createElement("button");
    closeButton.textContent = "✕";
    Object.assign(closeButton.style, {
      position:"absolute",top:"10px",right:"10px",width:"42px",height:"42px",
      border:"1px solid #ffffff66",borderRadius:"10px",background:"#101827dd",
      color:"white",font:"bold 20px system-ui",touchAction:"manipulation"
    });
    root.appendChild(closeButton);

    const touchPad = document.createElement("div");
    Object.assign(touchPad.style, {
      position:"absolute",left:"16px",bottom:"20px",width:"150px",height:"150px",
      display:isTouch?"grid":"none",gridTemplateColumns:"repeat(3,1fr)",
      gridTemplateRows:"repeat(3,1fr)",gap:"5px",touchAction:"none"
    });
    const touchButtons = {};
    const makeTouchButton = (label,key,row,col) => {
      const b=document.createElement("button");b.textContent=label;
      Object.assign(b.style,{
        gridRow:String(row),gridColumn:String(col),border:"1px solid #ffffff66",
        borderRadius:"12px",background:"#101827bb",color:"white",
        font:"bold 20px system-ui",touchAction:"none",userSelect:"none"
      });
      b.addEventListener("pointerdown",e=>{e.preventDefault();e.stopPropagation();keys.add(key);try{b.setPointerCapture(e.pointerId)}catch(_){}});
      const release=e=>{e.preventDefault();keys.delete(key)};
      b.addEventListener("pointerup",release);b.addEventListener("pointercancel",release);b.addEventListener("lostpointercapture",()=>keys.delete(key));
      touchPad.appendChild(b);touchButtons[key]=b;return b;
    };

    const keys = new Set();
    if(isTouch){
      makeTouchButton("▲","w",1,2);makeTouchButton("◀","a",2,1);
      makeTouchButton("▼","s",3,2);makeTouchButton("▶","d",2,3);
      const boost=document.createElement("button");boost.textContent="BOOST";
      Object.assign(boost.style,{
        position:"absolute",right:"18px",bottom:"26px",minWidth:"88px",height:"58px",
        border:"1px solid #ffffff66",borderRadius:"14px",background:"#a52a2acc",
        color:"white",font:"bold 14px system-ui",touchAction:"none"
      });
      const boostOn=e=>{e.preventDefault();keys.add("shift")};
      const boostOff=e=>{e.preventDefault();keys.delete("shift")};
      boost.addEventListener("pointerdown",boostOn);boost.addEventListener("pointerup",boostOff);
      boost.addEventListener("pointercancel",boostOff);boost.addEventListener("lostpointercapture",()=>keys.delete("shift"));
      root.appendChild(boost);
    }
    root.appendChild(touchPad);
    (document.body||document.documentElement).appendChild(root);

    const ctx=canvas.getContext("2d");
    let w=0,h=0,raf=0,last=performance.now();
    const hero={x:0,y:0,vx:0,vy:0,facing:1},camera={x:0,y:0};
    const heroImage=new Image();
    heroImage.src="https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/placeholder.png";
    const buildings=Array.from({length:100},(_,i)=>({x:i*150-1000,width:70+Math.random()*70,height:100+Math.random()*360}));

    function resize(){
      const d=Math.min(window.devicePixelRatio||1,2);
      w=window.innerWidth;h=window.innerHeight;
      canvas.width=Math.max(1,Math.floor(w*d));canvas.height=Math.max(1,Math.floor(h*d));
      ctx.setTransform(d,0,0,d,0,0);
    }
    resize();
    const onResize=()=>resize();
    const down=e=>{
      const k=e.key.toLowerCase();keys.add(k);
      if(["arrowup","arrowdown","arrowleft","arrowright"," "].includes(k))e.preventDefault();
    };
    const up=e=>keys.delete(e.key.toLowerCase());
    const close=()=>{
      cancelAnimationFrame(raf);
      removeEventListener("resize",onResize);removeEventListener("keydown",down);removeEventListener("keyup",up);
      keys.clear();root.remove();
    };
    closeButton.addEventListener("click",close);
    addEventListener("resize",onResize);addEventListener("keydown",down);addEventListener("keyup",up);

    function tick(now){
      const dt=Math.min((now-last)/1000,.033);last=now;
      if(keys.has("escape")){close();return;}
      let dx=0,dy=0;
      if(keys.has("a")||keys.has("arrowleft"))dx--;
      if(keys.has("d")||keys.has("arrowright"))dx++;
      if(keys.has("w")||keys.has("arrowup"))dy--;
      if(keys.has("s")||keys.has("arrowdown"))dy++;
      if(dx&&dy){dx*=Math.SQRT1_2;dy*=Math.SQRT1_2}
      const boost=keys.has("shift")?2.1:1,accel=850*boost,max=400*boost;
      hero.vx+=dx*accel*dt;hero.vy+=dy*accel*dt;
      const drag=Math.pow(.88,dt*60);hero.vx*=drag;hero.vy*=drag;
      hero.vx=Math.max(-max,Math.min(max,hero.vx));hero.vy=Math.max(-max,Math.min(max,hero.vy));
      hero.x+=hero.vx*dt;hero.y+=hero.vy*dt;
      if(hero.vx>8)hero.facing=1;if(hero.vx< -8)hero.facing=-1;
      camera.x+=(hero.x-camera.x)*Math.min(1,dt*5);camera.y+=(hero.y-camera.y)*Math.min(1,dt*5);
      draw();raf=requestAnimationFrame(tick);
    }
    function draw(){
      const sky=ctx.createLinearGradient(0,0,0,h);sky.addColorStop(0,"#48aee9");sky.addColorStop(1,"#d8f4ff");
      ctx.fillStyle=sky;ctx.fillRect(0,0,w,h);ctx.fillStyle="#ffffffaa";
      for(let i=0;i<10;i++){
        let x=((i*270-camera.x*.2)%(w+220));if(x< -110)x+=w+220;
        const y=70+(i%4)*90-camera.y*.08;
        ctx.beginPath();ctx.ellipse(x,y,48,15,0,0,Math.PI*2);ctx.ellipse(x+30,y-9,30,20,0,0,Math.PI*2);ctx.ellipse(x+58,y,38,14,0,0,Math.PI*2);ctx.fill();
      }
      ctx.fillStyle="#648da5";
      for(const b of buildings){const x=b.x-camera.x*.55,y=h-b.height+camera.y*.12;if(x+b.width>0&&x<w)ctx.fillRect(x,y,b.width,b.height)}
      const ground=h-28+camera.y*.2;ctx.fillStyle="#38834d";ctx.fillRect(0,ground,w,h-ground);ctx.fillStyle="#28633b";ctx.fillRect(0,ground,w,6);
      ctx.save();ctx.translate(w/2,h/2);ctx.scale(hero.facing,1);
      if(heroImage.complete&&heroImage.naturalWidth>0){
        const spriteH=isTouch?96:112,spriteW=spriteH*(heroImage.naturalWidth/heroImage.naturalHeight);
        ctx.drawImage(heroImage,-spriteW/2,-spriteH/2,spriteW,spriteH);
      }else{
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
  } catch(error) {
    console.error("[Invincible Interactive] startup error:",error);
    alert("Flight overlay failed to start: "+(error&&error.message?error.message:error));
  }
})();