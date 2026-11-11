# Mapeamento content snapshot

Versioned copies of the Mapeamento publicação inventory used by `npm run import:mapeamento`.

## Canonical source

```
/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_Publicacao/content
```

| File | Role |
| --- | --- |
| `inventory.json` | Flat block list (`sections` + `blocks`) from the Organizações DOCX |
| `findings.json` | Resumo executivo findings (optional reference; flow MDX comes from inventory) |

## Publication bundle

`npm run export:bundle` writes `content/publication.bundle.json`: document metadata, reading order, and **inline payloads** (timelines as JSON objects; flow chapters as a block AST derived from current MDX). The bundle is a supplementary serialized view for CMS/API iteration; `content/document.json` plus MDX/JSON files remain the React build source of truth. Re-export after `import:mapeamento` or chapter edits.

Last snapshot: 2026-11-11 01:06:38 UTC.

Re-copy with:

```bash
npm run snapshot:mapeamento
```
