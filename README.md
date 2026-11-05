# PlayGround

<!-- omgithub:readme:start -->
## 🚀 Build, play, and remix with OMGithub

**Created using [OMGithub.com](https://go.ondev.store/).**

[![OMGithub](https://img.shields.io/badge/OMGithub-Open%20project-orange?style=for-the-badge)](https://go.ondev.store/Hexyz0/PlayGround)
[![GitHub](https://img.shields.io/badge/GitHub-Source-181717?logo=github&style=for-the-badge)](https://github.com/Hexyz0/PlayGround)

- 🎮 [Open the project](https://go.ondev.store/Hexyz0/PlayGround).
- ✨ [Remix this project](https://go.ondev.store/Hexyz0/PlayGround?remix=1).
- 💻 [Explore the source](https://github.com/Hexyz0/PlayGround).
- 🛠️ [Check build runs](https://github.com/Hexyz0/PlayGround/actions).
- 🐛 [Report an issue](https://github.com/Hexyz0/PlayGround/issues).
- 👤 [Explore the creator's projects](https://go.ondev.store/Hexyz0).
- 🌍 [Create with OMGithub](https://go.ondev.store/).
<!-- omgithub:readme:end -->

## Hollow Crown — Skirmish

A complete, playable, portrait-first tactics game made for Android phones (and any modern
mobile browser). No frameworks, no external assets, no network required after the first load.

**Play:** open `index.html` through any static web server.

### How to play

1. Tap a hero card, then a **teal tile** to move. Each hero moves once per turn.
2. Tap a foe ringed in **red** to attack. Each hero attacks once per turn.
3. Press **End Turn** and the dead take their turn.

Clear five short stages. Fall, and you can retry the stage. Progress saves automatically at the
start of each stage.

- Warden: tough, 1-tile reach
- Ranger: fragile, 2-tile reach
- Hexblade: joins after stage 1, hits hardest
- Each victory grants a blessing: +1 ATK, +2 max HP, or +1 MOVE

### Mobile details

- Large touch targets and a portrait layout that fits within safe areas
- Tap-only controls (no drag, no tilt, no keyboard required)
- Safe-area insets, no page zoom, no pull-to-refresh, haptic feedback where supported
- Installable PWA with an offline service worker (`manifest.webmanifest`, `sw.js`)
- Landscape layout still works if the phone is rotated

### Project layout

```
index.html            game shell
css/style.css         mobile UI and responsive layout
js/game.js            rules, enemy AI, canvas renderer, save system
manifest.webmanifest  PWA metadata
sw.js                 offline cache
icons/                app icons
legacy/               previous full RPG build, preserved but unused
```

