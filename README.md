# Invincible Interactive — 2D Flight Bookmarklet

A lightweight 2D side-view flight sandbox injected into a webpage.

## Bookmarklet setup

Create a bookmark, edit its name (for example, **Invincible Flight**), and paste this entire one-line URL into the bookmark's URL/location field:

```javascript
javascript:(()=>{if(document.getElementById('ii-flight-loader')){document.getElementById('ii-flight-loader').remove();}const s=document.createElement('script');s.id='ii-flight-loader';s.src='https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/game.js?cb='+Date.now();s.onload=()=>console.info('[Invincible Interactive] game.js loaded');s.onerror=()=>alert('Could not load game.js. This page may block bookmarklets or raw.githubusercontent.com. Try a normal webpage, then check the browser console.');(document.head||document.documentElement).appendChild(s);})()
```

Click the saved bookmark on a normal webpage. If it still fails, open the browser developer console and look for the loader message or a Content Security Policy (CSP) error. Some sites block injected scripts; test on a simple page such as a blank tab or a basic website.

## Controls

- **WASD / Arrow keys:** Fly
- **Shift:** Boost
- **Esc:** Close the overlay

## Notes

The character uses the repository's `placeholder.png` sprite. The sandbox is a full-screen page overlay and does not modify the host site's files.
