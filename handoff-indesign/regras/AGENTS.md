# Agent notes

This repository builds one editorial document as React, previews it with Vite, and paginates it with Vivliostyle CLI. Read this file before changing the pipeline, the page model, or the sample.

**Operational workflow (every agent turn):** follow `.cursor/rules/vozes-editorial-workflow.mdc` (`alwaysApply`) — interpret plain-language edit requests; run bundle/validate without asking editors to name those steps. **Preserve every editor-agreed treatment** (MDX components, layout classes, CSS, assets) until they ask to change it; paginated preview and PDF render from MDX, so inventory-only state is not enough. After `import:mapeamento`, reconcile editorial patterns before claiming done. **Human editors (non-technical):** `docs/EDITAR-COM-AGENTE.md` — examples in natural Portuguese only.

## Architecture

Three composition strategies stay separate:

1. **Flow** (`strategy: "flow"`, `layout: "standard"`). Chapters in MDX. Prose, columns, figures, tables, pull quotes, and highlight boxes move in a stream. `StandardPage` is the frame.
2. **Structured** (`strategy: "structured"`, `layout: "timeline"`). JSON with a fixed shape. `TimelinePage` renders events. Do not turn a chronology into ordinary paragraphs to make pagination easier.
3. **Art-directed** (`strategy: "art-directed"`, `layout: "infographic"`). JSON supplies values. `InfographicPage` places them. Do not let that page grow like a chapter. If the copy no longer fits one page, change the layout or cut the copy, then check the PDF.

`content/document.json` is the only reading order. Files that are not listed there fail `npm run validate`.

**Source of truth for page content.** Reading order and metadata live in `content/document.json` (title, subtitle, section list). Section bodies live in the paths listed there (`content/chapters/*.mdx`, `content/timelines/*.json`, …). After changing any of those, run `npm run export:bundle` so `content/publication.bundle.json` stays aligned (required by `npm run validate`). Mapeamento upstream edits may also flow through `content/mapeamento/inventory.json` and `npm run import:mapeamento`. Layout and cover treatment (`sheetVariant: vozes-cover` on `chapters/capa.mdx`) live in MDX frontmatter and React/CSS — not in the old specimen masthead on the first chapter.

Content does not own trim, margins, or color. Those live in `src/styles/tokens.css`, with profile overrides in `src/styles/digital.css` and `src/styles/print.css`.

The React app does not paginate and does not import Vivliostyle. `src/engine/pagination.ts` names the engine. `scripts/build-pdf.ts` invokes it. Replace those two together if the engine changes. Keep the React tree free of PDF libraries. Do not add React-PDF. Do not add a backend.

`npm run dev` builds digital HTML and opens the Vivliostyle spread preview. For hot-reload editing without pagination, use `npm run dev:edit` (Vite). Vivliostyle lays out the HTML it loads and does not reflow a `#root` filled in afterwards, so `scripts/prerender-html.ts` replaces `dist/index.html` with static markup from `src/entry-server.tsx` after the production build. Do not point the PDF command at the dev server or `dev:edit`.

## Commands

Run these from the repository root.

User-facing:

| Command | What it does |
| --- | --- |
| `npm run dev` / `npm run visualizar` | Build digital, then Vivliostyle viewer with `spread=true` (facing pages) and page numbers from `paged.css`. Default http://127.0.0.1:13000. Watches `content/`, `src/`, `assets/`, and `vite.config.ts`; rebuilds and reloads the viewer on save (first build can be slow). Pass `-- --no-build` to skip the initial build when `dist/` exists. Editors say **visualizar** — use this script. |
| `npm run dev:edit` / `npm run editar` | Vite at http://127.0.0.1:5173. Hot reload, not paginated. Editors say **modo de edição**. |
| `npm run build` / `npm run gerar-pdf` | Validate, build digital, write `output/document-digital.pdf`. Editors say **gerar renderização PDF**. |
| `npm run pdf:print` / `npm run gerar-pdf-grafica` | Print profile PDF with bleed and crop marks. |

Maintainers:

| Command | What it does |
| --- | --- |
| `npm run dev:edit` | Vite preview at http://127.0.0.1:5173. Hot reload. Not paginated. |
| `npm run dev:bundle-proof` | Dev preview of one flow section from `publication.bundle.json` (`VITE_BUNDLE_PROOF=1`). Or use `dev:edit` with `?bundle=1&section=apresentacao`. |
| `npm run preview` | Static digital build at http://127.0.0.1:4173. Not paginated. |
| `npm run build:digital` | Typecheck, write `dist/`, then prerender static HTML for the digital profile. |
| `npm run build:print` | Typecheck, write `dist/`, then prerender static HTML for the print-layout profile. |
| `npm run pdf:digital` | Same pipeline as `npm run build` (digital PDF). |
| `npm run pdf:print` | Validate, build, write `output/document-print.pdf`. |
| `npm run preview:paged` | Paginated Vivliostyle viewer for an existing `dist/index.html`. Build first. Single-page view unless spread is enabled in the viewer UI. |
| `npm run export:bundle` | Write `content/publication.bundle.json` (manifest + inline section payloads). Flow chapters use `derivedFrom: "inventory"` when `content/mapeamento/inventory.json` exists (`src/content/inventory-to-blocks.ts`); `mdxBlocks` on the payload is for diff only. |
| `npm run validate` | Manifest, sources, assets, tokens, bundle alignment. |
| `npm run check` | `validate` plus TypeScript. |
| `npm run test:visual` | Playwright against `npm run dev:edit`. |
| `npm run import:organizacoes` | Regenerate chapters and timelines from the Mapeamento Organizações DOCX, then `export:bundle`. |
| `npm run snapshot:mapeamento` | Copy `inventory.json` and `findings.json` into `content/mapeamento/`. |
| `npm run import:mapeamento` | Snapshot Mapeamento JSON, regenerate MDX/timelines, then `export:bundle`. |

Upstream content for Mapeamento lives under `Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/content/`. Override with `MAPEAMENTO_CONTENT_DIR`, `MAPEAMENTO_INVENTORY`, or `ORGANIZACOES_DOCX`. Shared logic: `scripts/import_organizacoes_lib.py`.

The installed CLI, verified with `node_modules/.bin/vivliostyle --version` and `build --help`, is **Vivliostyle CLI 11.4.0** (core 2.45.2).

Digital PDF arguments:

```text
vivliostyle build dist/index.html --output output/document-digital.pdf --no-vite-config-file
```

Print layout adds `--crop-marks` and `--bleed <length>`. The length is read from `--bleed` in `src/styles/print.css`. Do not hardcode a second bleed in the script.

Do not pass `--size`. It would override the CSS trim. Do not pass `--press-ready`, `--preflight`, or `--cmyk` unless the user explicitly asks and you have read the current `--help` again. Those flags are not used here. `--press-ready` is documented by the CLI as a PDF/X-1a preflight. `--cmyk` is documented as converting CSS `device-cmyk()` colors only. This project does not emit `device-cmyk()`, does not embed an ICC profile, and does not claim print compliance. Upstream documentation says the Docker press-ready mode expects Docker. Do not describe a generated file as PDF/X, CMYK, or press-ready unless that exact command was run and the file was checked.

`--no-vite-config-file` is required so Vivliostyle renders the HTML this repo already built instead of consuming `vite.config.ts`.

PDF builds set Vite `base` to `/vivliostyle/`. CLI 11.4.0 serves the input directory on that path and opens the document from `/__vivliostyle-viewer`, which breaks relative `./static/...` URLs. Do not switch the PDF build back to `base: './'` unless a rebuilt PDF still contains the manuscript. The dev server stays at `/`.

If you upgrade `@vivliostyle/cli`, run `node_modules/.bin/vivliostyle build --help` and update `scripts/build-pdf.ts` and this file from that output. Do not invent flags.

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
- `src/styles/paged.css` sets `@page` with a literal A4 size and physical margins, because this Vivliostyle build did not paginate reliably when `@page` used CSS variables. If you change the trim or the margins, update the tokens and those literals together. `src/styles/print.css` replaces the page margin so the inner margin is 24mm.
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
3. Run `npm run dev:edit` or `npm run dev` and look at the affected sheet if the change is visual. For UI, exercise the page, not only a single screenshot.
4. Run `npm run build` when pagination, breaks, or type could change. Run `npm run pdf:print` when bleed, crop marks, or print margins change.
5. Do not claim a command succeeded unless it exited 0 and you read its page count and media box.
6. Do not commit generated `output/*.pdf` unless the user asks. `output/` is gitignored except `.gitkeep`.

## Sample

The specimen has four sections and must paginate to at least four pages:

- `opening` and `measures`: flow
- `milestones`: seven events, including the long `first-proof` event (two paragraphs) and the one-sentence `margin-note` event
- `pipeline`: one art-directed page

`scripts/build-pdf.ts` fails the build when the PDF has fewer than four pages, when the digital media box is not A4, or when the print media box is not larger than A4.
