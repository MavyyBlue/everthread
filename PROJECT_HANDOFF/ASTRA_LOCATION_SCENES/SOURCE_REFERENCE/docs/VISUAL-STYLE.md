# Visual direction

Original anime/manhwa-inspired environmental art: warm golden light, forest-teal architecture, honey oak, cream stone, careful linework and welcoming small-town spaces. Foreground props use matching materials and lighting. No people or interface lettering are baked into the art.

| Role | Dark | Light |
|---|---|---|
| Page | `#08191c` | `#eff2ec` |
| Sheet | `#102a2e` | `#fffef9` |
| Raised control | `#19373b` | `#e7efeb` |
| Main text | `#f3f3e8` | `#173035` |
| Secondary text | `#b4c6c3` | `#4d6566` |
| Primary action | `#47d6c5` | `#087c74` |
| Decorative gold | `#d8be79` | `#80621b` |
| Consequential action | `#ffacb0` | `#a12840` |

Use system sans-serif for controls and an available serif such as Georgia for room/sheet titles; no web-font dependency. Body 14–16 px, action title 15–16 px, page title 24–29 px. Small uppercase district/place labels are decorative context, never the sole accessible name. Sheet corner radius 24 px, action radius 12–13 px, padding 20 px, row gaps 8 px, minimum tap target 48 px.

Retain a visible location title behind overlays. The background dims gently when a sheet opens; the player remains in the room. Primary actions use teal, career exits use restrained rose, and Close/Back use quiet outlined controls. Do not use gold as a universal purchase/commit color.

All raster art was generated specifically for this handoff using the built-in image generator. `source/generation-prompts.json` preserves the original prompts. Generated shapes may contain decorative insignia, but no externally licensed brand identity was intentionally requested. The SVG UI assets and layout code were authored for this kit. PNG originals are unmodified; review boards composite them at display size. There are no external font, image-CDN or network dependencies.

The kit does not include separate pressed/hover versions of the 19 props. Use CSS/SVG outlines or glow for those transient UI states. Raster colors are baked; do not advertise arbitrary recoloring through nonexistent vector regions.
