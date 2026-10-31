# Invincible Interactive — 2D Flight Bookmarklet

A lightweight 2D side-view flight sandbox that can be injected into a webpage.

## Bookmarklet

Create a bookmark in your browser and set its URL/location to this **single line**:

```javascript
javascript:(()=>{const s=document.createElement('script');s.src='https://raw.githubusercontent.com/sspeth000/invincibleinteractive-bookmarklet-consolesupport/main/game.js';document.head.appendChild(s)})()
```

Then open a webpage and click the bookmark. Click it again, or press **Esc**, to close the sandbox.

> Some browsers block bookmarklets pasted directly into the address bar. Save it as a bookmark instead. The script is loaded from this repository's `game.js`.

## Controls

- **WASD / Arrow keys:** Fly in any direction
- **Shift:** Boost
- **Esc:** Close the overlay

## Notes

The current character is an original placeholder drawn with Canvas shapes. The game runs as a page overlay and does not modify the host site's files.
