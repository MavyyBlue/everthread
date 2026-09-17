# Start here, Coding Yuki

The map should open a place. Objects inside that place should open focused controls. Opening Weaver Park must not expose the old Activities tabs; opening Threadtone must not expose the old Career screen.

The producer’s desk contains **Leave Music Path**, **Retire**, and the sheet’s **Close** button. The recording booth contains **Release Song**, **Release Album**, and **Close**. Rehearsal and records have their own objects. Park trails contain movement options, the pavilion contains quiet wellness options, and the bench contains appropriate social plans.

## Package tour

| Path | Purpose |
|---|---|
| `index.html` | Offline reviewer with location, theme, width and sample-state controls |
| `prototype/` | Shared scene renderer and popup specimens; no game dependencies |
| `assets/backgrounds/` | 25 original portrait PNG environments, 1024 × 1536 |
| `assets/props/` | 19 transparent PNG object sprites; reused across 25 rooms |
| `assets/hotspots/` | 76 transparent SVG rectangle highlights in scene coordinates |
| `assets/ui/` | Buttons’ icons, a popup frame and a hotspot marker |
| `data/location-scenes.json` | Scene definitions, normalized hit regions and action registry |
| `data/asset-metadata.json` | Actual image sizes, alpha bounds and hashes |
| `asset-manifest.json` | Asset inventory, intended layer and integrity information |
| `review/` | Static image boards plus browsable location/prop/action sheets |
| `integration/` | Framework-neutral TypeScript geometry and dispatch contracts |
| `source/` | Prompts and reproducible manifest/review builders |

One foreground object per location is a separate transparent sprite. Secondary doors, rooms, counters and shelves are painted into the background and receive independent semantic hotspots. The manifest distinguishes these two kinds explicitly. Those background details cannot be independently moved or recolored without new art. All text and interactive controls remain real UI.

The hidden freight-yard scene is intentionally visible in this developer review pack. The integrated player UI must apply its existing discovery gate before displaying or preloading it.

## First integration slice

Implement Weaver Park and Threadtone first. Preserve the existing engine commands and current eligibility projections. Verify that every interaction returns to its originating room, then migrate the other locations through the same shared component. Keep Life, People and Map as the established top-level navigation. Yuki’s special Threadroom routing is separate and unchanged.

The JSON `routes` field records old map services for audit coverage only. It is not a new navigation table. Never execute its legacy destination strings from an object click.
