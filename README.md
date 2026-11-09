# Editorial Design

A React and TypeScript document that previews in the browser and paginates to PDF with [Vivliostyle CLI](https://docs.vivliostyle.org/). The sample is a specimen, not a finished book. Branding, trim, and margins are placeholders until an InDesign reference is measured.

The browser is the editing view. It shows A4 sheets and updates as you change components or content. It does not insert folios. Page breaks, running heads, and crop marks are produced by the PDF commands.

## Requirements

- Node.js 20 or newer
- npm

The PDF step uses Vivliostyle CLI 11.4.0 (Vivliostyle core 2.45.2), installed locally. The first PDF build downloads a browser for that CLI.

## Setup

```bash
npm install
```

## Edit

```bash
npm run dev
```

Open http://127.0.0.1:5173. Vite refreshes the page when you save a component, a style sheet, or a content file. New files under `content/` are picked up after a restart, because the manifest loader globs those folders at startup.

When the window is at least 840px wide, each sheet is the A4 trim. Narrower than that, the sheet fits the window so it stays readable beside the editor. The PDF is always the token trim.

`npm run preview` serves the last digital production build at http://127.0.0.1:4173. That HTML is already prerendered, and the browser still does not paginate it.

For a paginated viewer, build first and then open Vivliostyle's preview. This is slower than `npm run dev` and is not the editing loop:

```bash
npm run build:digital
npm run preview:paged
```

`preview:paged` runs `vivliostyle preview dist/index.html --no-vite-config-file`, which is the installed CLI's preview command.

## PDFs

```bash
npm run pdf:digital
npm run pdf:print
```

Outputs:

- `output/document-digital.pdf` — A4 trim, for reading on screen
- `output/document-print.pdf` — the same manuscript with crop marks and the bleed from `src/styles/print.css`

Both commands validate the manuscript, typecheck, build the assets, prerender the React tree to static HTML, then run Vivliostyle. The PDF command needs that static file: Vivliostyle keeps a client-rendered root on one page. The digital invocation is:

```bash
vivliostyle build dist/index.html --output output/document-digital.pdf --no-vite-config-file
```

The print invocation adds `--crop-marks` and `--bleed`, with the bleed length read from `src/styles/print.css`. The scripts do not pass `--size`, so the trim stays in CSS. They do not pass `--press-ready`, `--preflight`, or `--cmyk`. The PDF build writes asset URLs under `/vivliostyle/`, which is where CLI 11.4.0 serves the input directory. The dev server is unchanged at `/`.

## Checks

```bash
npm run validate
npm run check
npm run test:visual
```

`validate` checks the manifest, content files, asset paths, and design tokens. `check` adds the TypeScript projects. `test:visual` runs Playwright against the dev server. Install the Playwright browser once:

```bash
npx playwright install chromium
```

## Layout of the repo

| Path | Role |
| --- | --- |
| `content/document.json` | Order of the document |
| `content/chapters/` | Flow chapters (MDX) |
| `content/timelines/` | Structured chronologies (JSON) |
| `content/infographics/` | Art-directed pages (JSON) |
| `assets/` | Files copied into the site, including `assets/media/` |
| `src/components/` | Heading, Paragraph, PullQuote, HighlightBox, Figure, EditorialTable, Timeline |
| `src/layouts/` | StandardPage, TimelinePage, InfographicPage |
| `src/styles/tokens.css` | Page size, margins, type, color, spacing |
| `src/styles/digital.css` | Digital profile overrides |
| `src/styles/print.css` | Print-layout overrides (bleed and inner margin) |
| `src/engine/` | Which paginator the app expects. The app does not call it |
| `scripts/build-pdf.ts` | The paginator invocation |
| `scripts/prerender-html.ts` | Replaces `dist/index.html` with static markup before pagination |
| `output/` | Generated PDFs and the screen screenshot |

## Profiles

Screen, digital, and print share one manuscript.

- **Screen** is `npm run dev`. Sheets use the A4 trim so you can edit. Folios are not real.
- **Digital** is the distribution PDF. Trim only. RGB, as Chromium paints it.
- **Print layout** changes geometry: a larger inner margin in CSS, plus crop marks and bleed from the CLI. The sample does not draw into the bleed.

Vivliostyle CLI 11.4.0 also documents `--press-ready` (also `--preflight press-ready` or `--preflight press-ready-local`) for a PDF/X-1a path, and `--cmyk` to convert CSS `device-cmyk()` colors. This repo does not pass those flags. Upstream docs for the press-ready path say the Docker mode expects Docker. Nothing here embeds an ICC profile. A PDF from this repo is not a certified press file.

`@vivliostyle/cli` is AGPL-3.0. It is a development tool invoked as a binary. The document runtime does not import it.

Body type is Source Serif 4 and Source Sans 3, loaded through Fontsource (SIL Open Font License).

## Limitations

- The browser preview is not the paginated PDF.
- Page size defaults to A4 in `src/styles/tokens.css`. Change the tokens and the literal `@page` size in `src/styles/paged.css` together, then regenerate, before trusting a new trim.
- Print crop marks enlarge the PDF media box. The trim is still A4.
- No CMYK conversion, ICC profile, or PDF/X output is produced or checked.
- Timeline events and headings ask the paginator not to split (`break-inside` / `break-after`). An event taller than the text block can still overflow or split.
- There is no baseline grid, footnote system, index, table of contents, or running side note.
- The infographic is designed as one page. Long copy there will collide; it will not reflow like a chapter.
- MDX is checked for local assets and known components. Table shape is checked when the page renders.
- The screen sheet uses a warm paper color. PDF pages are white. That paper color is not a print stock.

## Next

Measure the InDesign file and replace the tokens and the sample copy. Decide what a printer actually requires before enabling any preflight flag. Extend artwork into the bleed only after the trim is real. Add repeated table headers when a table can cross a page.
