# Pixel character (Safed Kauwa)

The original block-pixel character and its "Say hi" mood picker, pulled out of the website so it can be reused anywhere.

- `index.html` — the section on its own. Open it in a browser.
- `character.js` — builds the character from the Figma blocks and exposes `window.Buddies`, `window.Buddy`, `window.BuddyStates`.
- `character.css` — the character's poses/animations, speech bubble, confetti and the section styling.

To use it on another page: include both files and add `<div data-buddy="demo"></div>` (or `data-buddy="main"` for the one controlled by `window.Buddy`).
Play a state: `Buddy.set("wave")`, or `Buddy.set("happy", 1800)` to return to idle after 1.8s.
States: idle, wave, typing, thinking, happy, oops, walking, celebrate.
