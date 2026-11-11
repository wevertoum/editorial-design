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

Last snapshot: 2026-11-11 14:20:30 UTC.

Re-copy with:

```bash
npm run snapshot:mapeamento
```
