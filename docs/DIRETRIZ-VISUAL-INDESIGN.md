# Diretriz visual — Levantamento Organizações 2026 (handoff InDesign)

Documento para continuar diagramação no **InDesign** (fonte de verdade visual). Resume o que foi **travado no briefing** e o que o repositório `editorial-design` implementou até nov/2026.

---

## 1. Produto e tom

| Item | Valor |
|------|--------|
| Título | Levantamento Internacional de Instituições de Apoio a Padrões Curriculares |
| Subtítulo | 2026 |
| Autor / marca | Vozes da Educação |
| Idioma | pt-BR |
| Tom | Relatório/revista (“Vozes Report”), não Word diagramado; copy conciso |
| Identidade | **Só Vozes** (paleta + grafismos). Logo Lemann só capa/rodapé quando existir |
| Cor por país | **Não** |

**Conteúdo:** importado literalmente do Word `4. [v1] Organizações (1).docx` → 26 seções, 5 países, spreads de cruzamento dual-track, 11 figuras em `assets/media/org-*.png`.

---

## 2. Formato de página (A4)

| Medida | Digital / tela | InDesign (ref. DECISOES) |
|--------|----------------|---------------------------|
| Trim | 210 × 297 mm | A4 |
| Margem superior | 18 mm (`@page`) | **70 pt** até primeira linha de texto (alinhar no INDD) |
| Margem inferior | 20 mm | conferir páginar rodapé/fonte |
| Margem interna (esq.) | 22 mm (digital); **24 mm** no perfil print | espelhar facing se aplicável |
| Margem externa (dir.) | 16 mm | idem |
| Sangria (print) | 3 mm (`print.css`, crop marks no PDF) | padrão de produção |

**PDF de referência no repo:** `npm run build` → `output/document-digital.pdf` (media 595,28 × 841,89 pt, ~68 págs.).

**Prévia paginada (`npm run dev`):** Vivliostyle com spread e numeração. Edição rápida sem paginação: `npm run dev:edit`. Quebras inteligentes **só** no Vivliostyle (PDF ou `npm run dev`). Não simular paginação por corte de altura em pixels.

---

## 3. Tipografia

| Papel | Família | Uso |
|-------|---------|-----|
| Display / anos timeline | **Roboto Slab** Bold | Títulos de abertura de país, anos no dual-track, marcos (anos) |
| UI e corpo | **Mulish** | Parágrafos, H2/H3 de capítulo, tabelas, tags, notas |

### Escala implementada (web/PDF)

| Estilo | Tamanho | Leading | Peso / notas |
|--------|---------|---------|----------------|
| Corpo | 9,5 pt | 1,37 (~13 pt) | Regular; **não justificado**; hifenização ativa |
| H2 seção (1. O currículo…) | 13 pt | 1,23 | Bold 700, preto |
| H3 (1.1. …) | 11 pt | 1,27 | Semibold 600, **Roxo 2** `#8146cb` |
| Kicker / país | 8 pt | — | Caps, tracking, Roxo marca |
| Abertura país (H1) | 28 pt | 1,1 | Slab, preto |
| Lead país | 10 pt | 1,4 | Mulish |
| Legenda figura | 7,5 pt | 1,35 | muted |
| Tabela Vozes | 8 pt | — | ver seção 6 |
| Nota Fonte | 7,5 pt | 1,35 | cinza; fio superior |
| Ano dual-track | 16 pt | 1,1 | Slab centro, Roxo 2 |
| Texto nó dual-track | 8 pt | 1,3 | preto |

**Alvo editorial (DECISOES):** prosa **≤ ~65 CPL** → colunas **3/6** na grade, ~52–55 CPL em Mulish 9,5.

---

## 4. Cor — papéis semânticos

| Token | Hex | Uso |
|-------|-----|-----|
| Roxo | `#493975` | Marca, kicker, eixo suave |
| Roxo 2 | `#8146cb` | H3, header tabela, anos, labels perfil, títulos de faixa |
| Verde | `#0d6353` | Tag trilho “currículo” |
| Verde vivo | `#01c689` | **Só** linha/gráfico de trilho (não decoração geral) |
| Rosa | `#ef5ca1` | Tag trilho “organização” |
| Laranja | `#ff8327` | **Só** bullet de lista detalhe |
| Marfim | `#f3eee6` | Painel org (1ª pág.), banda timeline, zebra leve de tabela, card perfil |
| Preto | `#000000` | Corpo principal |
| Muted | `#4a4a4a` | Legendas, fonte |
| Regra | `#d9d2c8` | Fios discretos |

**Regra de ouro (InDesign):** **um acento por zona**; T2/T3 em preto salvo H3 roxo; sem tags CAPS inventadas (ATORES, QUEM FAZ O QUÊ, etc.).

---

## 5. Grade — 6 colunas lógicas

Dentro da **área útil** (após margens da página):

- **Gutter:** 4,5 mm entre colunas lógicas.
- **6 colunas** de largura igual: `(largura útil − 5×4,5 mm) / 6`.

### Prosa sem rail (`vozes-prose-only`)

| Faixa | Span | Função |
|-------|------|--------|
| Colunas 1–3 | 3/6 | Texto principal |
| Coluna 4 | 1/6 | **Respiro** (vazio) |
| Colunas 5–6 | 2/6 | Livres (sem “coluna fantasma” preenchida com texto) |

O miolo **nunca** usa largura full na prosa de introdução/corpo.

### Prosa com rail (`vozes-with-rail`)

| Faixa | Span |
|-------|------|
| Prosa | 3/6 |
| Respiro | 1/6 |
| Aside / facts | 2/6 |

No documento Organizações importado, o `<VozesRail>` está vazio na maior parte; o layout ainda reserva 3+1+2 para alinhar com o piloto InDesign.

### Intro timeline dual-track

Lede em **50%** da área útil (equivalente ao span 3/6).

---

## 6. Componentes ↔ InDesign

| Peça | Comportamento visual |
|------|----------------------|
| **Masthead** (só 1ª seção doc) | Título relatório, ano, autor, fio |
| **Country opening** | Código país caps roxo 2; H1 Slab; lead |
| **Tabela `variant="vozes"`** | Header fundo Roxo 2, texto branco; zebra Marfim; sem caption visível (acessível) |
| **Figure** | Largura 100% da coluna prosa; radius 1 mm; sombra leve; legenda 7,5 pt |
| **Lista detalhe** | Bullet **laranja** explícito; hanging 4 mm |
| **Painel org** (`org-panel-page`) | Fundo Marfim, padding ~5 mm; **só 1ª página** da org; continuação sem painel |
| **Profile card** | Marfim; foto circular overlap ½ para fora do card (26 mm); cargo em *itálico* roxo 2 |
| **Callout / Facts rail** | Callout: tint 10% roxo 2; Facts: Marfim |
| **Milestone strip** | Ano Slab roxo 2; grade 16 mm + texto; fios 15% preto |
| **SourceNote / Fonte** | Rodapé da área; fio 0,35 mm 40% preto |
| **Timeline dual-track** | Spread Hofmann: banda Marfim ~**62%** altura útil, sangra nas margens horizontais da página; eixo roxo; tags CURRÍCULO (verde) / ORGANIZAÇÃO (rosa); **máx. 4 nós** por metade de spread; anos Slab roxo 2 centrados |

Seções de cruzamento: JSON em `content/timelines/*-cruzamento-*-{a,b}.json`, `variant: dual-track`, partes `a`/`b` do spread.

---

## 7. Paginação e quebras (PDF / InDesign)

- Nova **seção** do manifesto → nova página (`break-before: page` entre `.sheet`).
- Dentro do capítulo (um país = muitas páginas PDF): fluxo contínuo no Vivliostyle.
- **Órfãs/viúdas:** mínimo 3 linhas.
- **Evitar quebra interna:** figuras, tabelas, pull quote, dual-track node, itens de lista detalhe, eventos timeline.
- **Título + primeiro parágrafo:** manter juntos (`break-after` / `break-before avoid`).
- **Não** quebrar parágrafo “na marra” (o problema da prévia dev por fatiamento de pixels foi **removido**).

Notas de rodapé (InDesign): clearance **32 pt**, fio **0,5 pt** preto 40%, bloco no fundo da área útil.

---

## 8. Arquivos e pastas úteis

| O quê | Onde |
|-------|------|
| Briefing / decisões | `/Users/anaterra/Documents/Mapeamento-Organizacoes-Lemann-Vozes/01_Briefing/DECISOES.md` |
| InDesign piloto | `.../03_InDesign/Mapeamento Organizacoes.indd` |
| Renders aprovação | `.../03_InDesign/_render/_out/aprovacao-v2-*.jpg` |
| Manual marca | `.../02_Identidade/manual/manual-identidade.pdf` |
| Manifesto ordem de leitura | `editorial-design/content/document.json` |
| Estilos Vozes (CSS = spec) | `editorial-design/src/styles/vozes.css`, `tokens.css`, `paged.css` |
| Import DOCX → MDX | `editorial-design/scripts/import-organizacoes-docx.py` (`npm run import:organizacoes`) |
| Fontes embutidas | `editorial-design/assets/fonts/` (Mulish + Roboto Slab) |

---

## 9. O que o outro chat / InDesign deve priorizar

1. **Medir no INDD** margem superior 70 pt e alinhar com PDF se necessário (web ainda usa 18 mm em `@page`).
2. Manter **grade 6 cols**, prosa **span 3**, coluna de **ar**, rail **span 2** quando houver aside.
3. Replicar **hierarquia de cor** (laranja só bullet, verde vivo só trilho, roxo 2 em UI).
4. **Timelines:** 2 spreads por país, 4 nós por página da banda; fonte na página direita do spread quando houver.
5. **Org:** painel Marfim apenas na abertura da organização; perfil com overlap de foto.
6. Usar **PDF digital** gerado pelo repo como prova de paginação, não o scroll do `npm run dev:edit`.

---

## 10. Comandos rápidos (repo `editorial-design`)

```bash
npm run dev                    # spreads + numeração (Vivliostyle)
npm run dev:edit               # hot reload, sem paginar
npm run build                  # PDF A4 paginado (referência)
npm run import:organizacoes    # reimportar do DOCX
```

---

*Gerado para handoff InDesign — nov/2026. Atualizar este arquivo se DECISOES ou `vozes.css` mudarem.*
