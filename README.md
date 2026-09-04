# Everthread — Life Unwritten

Everthread is an original, mobile-first procedural text life simulator. One button moves life forward; choices, relationships, careers, finances, health, family, crime, fame, and generations determine what happens next.

## Play the current build

The `main` branch automatically builds and deploys to GitHub Pages after each successful push. The playable development build is available at:

**https://mavyyblue.github.io/everthread/**

The game is designed primarily for phone browsers. Saves use IndexedDB and remain on the device/browser that created them.

## Development status

Everthread is a pre-release game under active development. See:

- `DEVELOPMENT.md` — implemented systems, work in progress, known issues, architecture decisions
- `CONTENT.md` — current content counts and gaps
- `CHANGELOG.md` — milestone changes

## Local development

Requires Node.js 22+.

```bash
npm install
npm run dev
```

Useful verification commands:

```bash
npm test
npm run typecheck:engine
npm run typecheck:tests
npm run sim:neutral
```

## Intellectual property

Everthread's branding, writing, balancing, data, interface, systems implementation, and assets are original. It is a life-simulation game in the broader genre and does not reproduce proprietary text, code, artwork, interfaces, achievement/challenge names, or exact balancing from other games.
