# Invincible Interactive — 2D Flight Bookmarklet

A lightweight 2D side-view flight sandbox injected into a webpage.

## Bookmarklet setup

Create a bookmark, edit its name (for example, **Invincible Flight**), and paste this entire one-line URL into the bookmark's URL/location field:

```javascript
javascript:(()=>{const ID='ii-flight-loader-status';let box=document.getElementById(ID);if(!box){box=document.createElement('div');box.id=ID;Object.assign(box.style,{position:'fixed',zIndex:2147483647,top:'12px',left:'12px',padding:'10px 14px',background:'#101827',color:'white',font:'14px system-ui',borderRadius:'8px',maxWidth:'90vw'});(document.body||document.documentElement).appendChild(box)}box.textContent='Loading Invincible Flight configuration…';fetch('https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/configuration.js').then(r=>{if(!r.ok)throw Error('HTTP '+r.status);return r.text()}).then(code=>{const s=document.createElement('script');s.textContent=code;(document.head||document.documentElement).appendChild(s);box.remove()}).catch(e=>{box.textContent='Could not load configuration.js: '+e.message})})()
```

The bookmarklet loads `configuration.js`. Choose **Mobile** or **PC** in the on-page selector, and the configuration file loads the matching game script. The game scripts stay separate, so mobile uses touch controls and PC uses keyboard controls.

## Controls

- **Mobile:** Analog joystick to fly, BOOST button to accelerate, × to close.
- **PC:** WASD / Arrow keys to fly, Shift to boost, Esc or × to close.

## Notes

The character uses the repository's `placeholder.webp` sprite. The sandbox is a full-screen page overlay and does not modify the host site's files.
