# Agent notes

This repository builds one editorial document as a React site (Vite) and exports a PDF by printing that site with Chromium. Read this file before changing the pipeline, the page model, or the sample.

**Operational workflow (every agent turn):** follow `.cursor/rules/vozes-editorial-workflow.mdc` (`alwaysApply`) — interpret plain-language edit requests; run bundle/validate without asking editors to name those steps. **Preserve every editor-agreed treatment** (MDX components, layout classes, CSS, assets) until they ask to change it; the site and the PDF render from MDX, so inventory-only state is not enough. After `import:mapeamento`, reconcile editorial patterns before claiming done. **Human editors (non-technical):** `docs/EDITAR-COM-AGENTE.md` — examples in natural Portuguese only.

## Architecture

Three composition strategies stay separate:

1. **Flow** (`strategy: "flow"`, `layout: "standard"`). Chapters in MDX. Prose, columns, figures, tables, pull quotes, and highlight boxes move in a stream. `StandardPage` is the frame.
2. **Structured** (`strategy: "structured"`, `layout: "timeline"`). JSON with a fixed shape. `TimelinePage` renders events. Do not turn a chronology into ordinary paragraphs to make pagination easier.
3. **Art-directed** (`strategy: "art-directed"`, `layout: "infographic"`). JSON supplies values. `InfographicPage` places them. Do not let that page grow like a chapter. If the copy no longer fits one page, change the layout or cut the copy, then check the PDF.

`content/document.json` is the only reading order. Files that are not listed there fail `npm run validate`.

**Source of truth for page content.** Reading order and metadata live in `content/document.json` (title, subtitle, section list). Section bodies live in the paths listed there (`content/chapters/*.mdx`, `content/timelines/*.json`, …). After changing any of those, run `npm run export:bundle` so `content/publication.bundle.json` stays aligned (required by `npm run validate`). Mapeamento upstream edits may also flow through `content/mapeamento/inventory.json` and `npm run import:mapeamento`. Layout and cover treatment (`sheetVariant: vozes-cover` on `chapters/capa.mdx`) live in MDX frontmatter and React/CSS — not in the old specimen masthead on the first chapter.

Content does not own trim, margins, or color. Those live in `src/styles/tokens.css`, with profile overrides in `src/styles/digital.css` and `src/styles/print.css`.

Work happens in the Vite site. `src/engine/pagination.ts` names the PDF exporter. `scripts/build-pdf.ts` builds the site and prints it with Playwright (`page.pdf`). Replace those two together if the exporter changes. Keep the React tree free of PDF libraries. Do not add React-PDF. Do not add a backend. Do not bring back a paginated preview engine.

`npm run dev` (also `visualizar`, `editar`, `dev:edit`) is the site at http://127.0.0.1:5173, with hot reload. Each section is a sheet on the desk. Page breaks and page numbers appear in the PDF, not in a second viewer.

## Commands

Run these from the repository root.

User-facing:

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run visualizar` / `npm run editar` / `npm run dev:edit` | Vite site at http://127.0.0.1:5173. Hot reload. Editors say **visualizar** or **modo de edição** — same site. |
| `npm run build` / `npm run gerar-pdf` | Validate, build the site, print it to `output/document-digital.pdf` (A4). Editors say **gerar renderização PDF**. |
| `npm run pdf:print` / `npm run gerar-pdf-grafica` | Same print, with bleed (`output/document-print.pdf`). No crop marks. |

Maintainers:

| Command | What it does |
| --- | --- |
| `npm run dev:bundle-proof` | Dev preview of one flow section from `publication.bundle.json` (`VITE_BUNDLE_PROOF=1`). Or open the site with `?bundle=1&section=apresentacao`. |
| `npm run preview` | Static production build at http://127.0.0.1:4173. The PDF script uses port 4174 so it does not collide with this. |
| `npm run build:digital` | Typecheck and write `dist/` for the digital profile. |
| `npm run build:print` | Typecheck and write `dist/` for the print-layout profile. |
| `npm run pdf:digital` | Same pipeline as `npm run build` (digital PDF). |
| `npm run pdf:print` | Validate, build, write `output/document-print.pdf`. |
| `npm run export:bundle` | Write `content/publication.bundle.json` (manifest + inline section payloads). Flow chapters use `derivedFrom: "inventory"` when `content/mapeamento/inventory.json` exists (`src/content/inventory-to-blocks.ts`); `mdxBlocks` on the payload is for diff only. |
| `npm run validate` | Manifest, sources, assets, tokens, bundle alignment. |
| `npm run check` | `validate` plus TypeScript. |
| `npm run test:visual` | Playwright against the Vite site. |
| `npm run import:organizacoes` | Regenerate chapters and timelines from the Mapeamento Organizações DOCX, then `export:bundle`. |
| `npm run snapshot:mapeamento` | Copy `inventory.json` and `findings.json` into `content/mapeamento/`. |
| `npm run import:mapeamento` | Snapshot Mapeamento JSON, regenerate MDX/timelines, then `export:bundle`. |

Upstream content for Mapeamento lives under `Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/content/`. Override with `MAPEAMENTO_CONTENT_DIR`, `MAPEAMENTO_INVENTORY`, or `ORGANIZACOES_DOCX`. Shared logic: `scripts/import_organizacoes_lib.py`.

PDF export serves the production build and calls Playwright `page.pdf`. Digital trim is A4 (`210mm` × `297mm`) with margins `18mm 16mm 20mm 22mm`. Print trim grows by the 3mm bleed in `src/styles/print.css` (`216mm` × `303mm`); those numbers are repeated in `scripts/build-pdf.ts`. Change them together. The script clears CSS `@page` margins at print time so they do not stack on the Playwright margins. Page numbers are the Chromium footer.

Do not describe a generated file as PDF/X, CMYK, or press-ready. Nothing here converts color, embeds an ICC profile, or draws crop marks. Vite `base` stays `/`.

## Content conventions

- Flow chapters: `content/chapters/<slug>.mdx`, with YAML frontmatter `sheetVariant` and optional `kicker` (omit `kicker` on `apresentacao`, `resumo-executivo`, and `capa`).
- Timelines: `content/timelines/<slug>.json`.
- Infographics: `content/infographics/<slug>.json`.
- Manifest paths are relative to `content/` and one folder deep. The loader globs those three folders.
- MDX uses the shared components: `PullQuote`, `HighlightBox`, `Figure`, `EditorialTable`, `Columns`. Do not import components inside a chapter.
- Figures use a local `src` such as `media/page-grid.svg`, plus `alt`, `caption`, and optional `credit`. Files live in `assets/media/` because `assets/` is the Vite public directory.
- Timeline `body` and `lede` are arrays of paragraphs. Keep each event's paragraphs inside that event. Do not split one event across multiple JSON objects to fake a page break.
- Infographic copy stays short. The layout is the design.

IDs are lowercase slugs. Section ids and event ids share the document, so they must not collide.

## Presentation conventions

- Change page size, margins, type, color, and spacing in `src/styles/tokens.css`. The initial trim is A4 (`210mm` by `297mm`).
- `src/styles/paged.css` sets `@page` with a literal A4 size and physical margins. Chromium does not resolve `var()` inside `@page`. If you change the trim or the margins, update the tokens, those literals, and the matching numbers in `scripts/build-pdf.ts` together. `src/styles/print.css` enlarges the page by the bleed and increases the inner margin.
- Screen sheets in `src/styles/screen.css` use the same margin tokens as padding. PDF margins come from `@page`. Do not add screen padding that also applies in print, or the PDF will double the margin.
- At viewports under 840px the screen sheet shrinks to the window. Do not copy that override into print CSS. The PDF keeps the token trim.
- Headings, kickers, and the masthead use `break-after: avoid`. The following paragraph uses `break-before: avoid`.
- `.timeline-event`, figures, tables, pull quotes, highlight boxes, and the infographic use `break-inside: avoid`.
- Each section starts a new PDF page via `.sheet + .sheet { break-before: page; }`.
- Vozes PDF margins omit running heads (`@top-left` / `@top-right` are empty in `paged.css`). Capítulos de abertura (`apresentacao`, `resumo-executivo`) não usam `kicker` no frontmatter — só o `h2` no corpo. Outros fluxos podem manter `kicker` na folha quando o rótulo não repete um título visível no texto.
- The warm sheet color is a screen preview. Do not treat it as a printed stock. PDF page backgrounds stay white.
- Placeholder naming is "Specimen" / "Editorial Desk". Do not invent a final brand.

## When you change something

1. Keep the strategy and the layout paired. The schema rejects mismatches.
2. Run `npm run validate` after content or token edits.
3. Run `npm run dev` and look at the affected sheet if the change is visual. For UI, exercise the page, not only a single screenshot.
4. Run `npm run build` when page breaks or type in the PDF could change. Run `npm run pdf:print` when bleed or print margins change.
5. Do not claim a command succeeded unless it exited 0 and you read its page count and media box.
6. Do not commit generated `output/*.pdf` unless the user asks. `output/` is gitignored except `.gitkeep`.

## PDF check

`scripts/build-pdf.ts` fails the build when the PDF has fewer than 24 pages, when the digital media box is not A4, or when the print media box is not larger than A4.
