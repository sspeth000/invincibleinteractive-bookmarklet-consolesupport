# Invincible Interactive — 2D Flight Bookmarklet

A lightweight 2D side-view flight sandbox injected into a webpage.

## Bookmarklet setup

Create a bookmark, edit its name (for example, **Invincible Flight**), and paste this entire one-line URL into the bookmark's URL/location field:

```javascript
javascript:(()=>{const ID='ii-flight-loader-status';let box=document.getElementById(ID);if(!box){box=document.createElement('div');box.id=ID;Object.assign(box.style,{position:'fixed',zIndex:2147483647,top:'12px',left:'12px',padding:'10px 14px',background:'#101827',color:'white',font:'14px system-ui',borderRadius:'8px',maxWidth:'90vw'});(document.body||document.documentElement).appendChild(box)}box.textContent='Loading Invincible Flight…';fetch('https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/interactivemobile.js').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()}).then(code=>{const s=document.createElement('script');s.textContent=code;(document.head||document.documentElement).appendChild(s);setTimeout(()=>{if(document.getElementById('ii-flight-sandbox'))box.remove();else box.textContent='Failed to fetch. The site may be refusing to run the code, so run it via Developer Console.'},1200)}).catch(()=>{box.textContent='Failed to fetch. The site may be refusing to run the code, so run it via Developer Console.'})})()
```

This loader fetches `interactivemobile.js` and injects its contents. If fetching or initialization fails, it displays: **“Failed to fetch. The site may be refusing to run the code, so run it via Developer Console.”**

## Controls

- **WASD / Arrow keys:** Fly
- **Shift:** Boost
- **Esc:** Close the overlay

## Notes

The character uses the repository's `placeholder.png` sprite. The sandbox is a full-screen page overlay and does not modify the host site's files.
