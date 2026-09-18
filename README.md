# TEZ-NFTGallery

A color-sorted gallery for Tezos NFTs. Enter any Tezos wallet address and it pulls every FA2 token that address holds, lays them out as a masonry grid, and orders them by the dominant color sampled from each piece – grayscale first (by brightness), then the rest around the color wheel by hue – so a wallet's collection reads as one continuous gradient rather than a random grid.

## Features

- **Address lookup** – enter a `tz1…`/`KT1…` address; no wallet connection or API key needed.
- **Color-sorted masonry grid** (responsive 1–4 columns via `react-masonry-css`), with images resolved from IPFS.
- **Color filter** – narrow the grid to All / Grayscale / Red / Green / Blue / Yellow / Purple, categorized from each NFT's own sampled color.
- **Detail modal** – click any piece for its full image, description, token ID, and a link to its artifact URI.
- **Art Display mode** – a fullscreen slideshow (10s per image, 1s crossfade) over the current filtered set; press `Esc` to exit. Good for running a collection as ambient wall art or a kiosk display.
- **Dark/light theme toggle**, defaulting to the OS preference and persisted in `localStorage`.
- Minimal black-and-white, bordered, monospace (VT323) visual style throughout.

## How it works

1. On submit, the app pages through the [TzKT](https://api.tzkt.io/) indexer API (`GET /v1/tokens/balances`) to fetch every FA2 token balance for the given address, 100 at a time, with a progress bar tracking pages fetched against the total count.
2. Each token's `artifactUri`/`displayUri`/`thumbnailUri` metadata is rewritten from `ipfs://` to an `https://ipfs.io/ipfs/` gateway URL.
3. For each NFT's display image, a hidden canvas samples ~1000 pixels and averages them to an RGB value (`extractColor`) – this is what drives both the sort order and the color filter. If an image fails to load or can't be read (e.g. a CORS-restricted gateway), that NFT just sorts as black/falls back to "All" rather than blocking the rest.
4. The full list re-sorts (grayscale-by-brightness, then color-by-hue) and re-renders as each page of results comes in, so the grid fills in progressively rather than waiting for the whole collection.

No backend of its own – it's a static client-side app talking directly to the public TzKT API and public IPFS gateways.

## Tech stack

Vite + React 18 + TypeScript + Tailwind CSS, with `lucide-react` for icons and `react-masonry-css` for the grid. `eslint.config.js` is set up for linting.

## Run it

```bash
npm install
npm run dev       # local dev server (Vite)
```

Other scripts:

```bash
npm run build      # production build
npm run preview    # preview the production build locally
npm run lint       # eslint
```

## Project layout

| Path | What it is |
|---|---|
| `src/App.tsx` | Top-level state, address form, TzKT fetching/pagination, color extraction, and sort logic. |
| `src/components/NFTGallery.tsx` | The masonry grid, loading/empty states, and color-category filtering. |
| `src/components/ColorFilter.tsx` | The color-category dropdown. |
| `src/components/NFTModal.tsx` | The full-detail modal for a selected NFT. |
| `src/components/ArtDisplay.tsx` | The fullscreen slideshow ("Art Display") mode. |
| `src/components/ThemeToggle.tsx` | Dark/light mode toggle. |
| `src/types.ts` | The `NFT` type shared across components. |
