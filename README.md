# Editorial Design

A React and TypeScript document. You edit it as a website, then print that site to PDF.

## Requirements

- Node.js 20 or newer
- npm

The PDF step uses Playwright's Chromium. Install it once:

```bash
npx playwright install chromium
```

## Setup

```bash
npm install
```

## Work on the document

```bash
npm run dev
```

Vite at http://127.0.0.1:5173 with hot reload. Each section is an A4 sheet on the desk. `npm run visualizar` and `npm run editar` start the same site.

See [docs/PREVIEW.md](docs/PREVIEW.md) for a short Portuguese guide.

## PDF

```bash
npm run build
```

Writes `output/document-digital.pdf` — A4, for reading on screen. The command runs `validate`, typechecks, builds the site, then prints it.

For the print layout (bleed from `src/styles/print.css`, no crop marks), maintainers use `npm run pdf:print` → `output/document-print.pdf`.

`npm run preview` serves the last production build at http://127.0.0.1:4173.

## Checks

```bash
npm run validate
npm run check
npm run test:visual
```

`validate` checks the manifest, content files, asset paths, and design tokens. `check` adds the TypeScript projects. `test:visual` runs Playwright against the Vite site.

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
| `src/engine/` | Which PDF exporter the app expects. The app does not call it |
| `scripts/build-pdf.ts` | Builds the site and prints it |
| `output/` | Generated PDFs and the screen screenshot |

## Profiles

Screen, digital, and print share one manuscript.

- **Screen** is `npm run dev`. This is the working view.
- **Digital** is the distribution PDF (`npm run build`). Trim only. RGB, as Chromium paints it.
- **Print layout** enlarges the page by the bleed and increases the inner margin. It does not draw crop marks.

Nothing here converts color, embeds an ICC profile, or produces PDF/X. A PDF from this repo is not a certified press file.

Body type is Source Serif 4 and Source Sans 3, loaded through Fontsource (SIL Open Font License).

## Limitations

- The preview and the PDF use the same A4 pages. Content that does not fit continues on the next page.
- Page size defaults to A4 in `src/styles/tokens.css`. Change the tokens, the literal `@page` size in `src/styles/paged.css`, and the sizes in `scripts/build-pdf.ts` together.
- Print bleed enlarges the PDF media box. The trim is still A4. There are no crop marks.
- No CMYK conversion, ICC profile, or PDF/X output is produced or checked.
- Timeline events and headings ask the printer not to split (`break-inside` / `break-after`). An event taller than the text block can still overflow or split.
- There is no baseline grid, footnote system, index, or running side note.
- The infographic is designed as one page. Long copy there will collide; it will not reflow like a chapter.
- MDX is checked for local assets and known components. Table shape is checked when the page renders.
- The screen sheet uses a warm paper color. PDF pages are white. That paper color is not a print stock.
