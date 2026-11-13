# Diretriz visual — Levantamento Organizações 2026 (handoff InDesign)

Documento para continuar diagramação no **InDesign** (fonte de verdade visual no `.indd`). Resume o que foi travado no briefing e o que o repositório `editorial-design` implementou até **11/nov/2026**.

Pacote pronto: pasta `handoff-indesign/` na raiz do repo (ver `00-LEIA-ME.md`).

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

**Conteúdo:** 5 países (AU, US, GB, NG, CL), capa/front matter, spreads de cruzamento dual-track, figuras em `assets/media/org-*.png`.

---

## 2. Formato de página (A4)

| Medida | Digital / PDF repo | InDesign (ref. DECISOES) |
|--------|--------------------|---------------------------|
| Trim | 210 × 297 mm | A4 |
| Margem superior | 18 mm (`@page`) | **70 pt** até primeira linha (alinhar no INDD) |
| Margem inferior | 20 mm | conferir rodapé/fonte |
| Margem interna | 22 mm (digital); **24 mm** print | espelhar facing |
| Margem externa | 16 mm | idem |
| Sangria (print) | 3 mm + crop marks | padrão de produção |

**PDF de prova (kit InDesign):** `handoff-indesign/prova/document-digital.pdf`.  
No repo web, o mesmo arquivo sai em `output/document-digital.pdf` após `npm run build` — só relevante se ainda mantiver o pipeline React.

---

## 3. Tipografia

| Papel | Família | Uso |
|-------|---------|-----|
| Display / anos | **Roboto Slab** Bold | H1 país, anos dual-track, anos MilestoneStrip |
| UI e corpo | **Mulish** | Parágrafos, H2/H3, tabelas, tags, notas |

### Escala atual (`tokens.css` + `vozes.css`)

| Estilo | Tamanho | Leading | Peso / notas |
|--------|---------|---------|----------------|
| Corpo | **10 pt** | **1,41** | Regular; **não justificado**; hifenização ativa |
| H2 seção | 13 pt | 1,23 | Bold 700, **preto** |
| H3 (sistema, governança…) | 11 pt | 1,27 | Semibold 600, **preto** (`--color-ink`) — **não** Roxo 2 |
| Rótulo de faixa (`.band-label`) | < H3 | — | Caps, **verde** `#0d6353` + filete |
| Kicker / país | 8 pt | — | Caps, tracking, Roxo marca |
| Abertura país (H1) | 28 pt | 1,1 | Slab, preto |
| Lead país | 10 pt | 1,4 | Mulish |
| Legenda figura | 7,5 pt | 1,35 | muted |
| Tabela Vozes | 8 pt | — | header Roxo 2 |
| Nota Fonte | 7,5 pt | 1,35 | cinza; fio superior |
| Ano dual-track | ~16 pt (11,5 pt se 5 nós) | 1,1 | Slab, Roxo 2; marcador **1,4 mm** no eixo, **sem cobrir dígitos** |
| Currículo / Organização | 7,5 pt (7 pt se 5 nós) | 1,3 | preto; tags CURRÍCULO verde / ORGANIZAÇÃO rosa |
| Síntese (`resumo`) | 8,5 pt Slab | 1,32 | **depois** de Organização |

**Alvo editorial:** prosa confortável na referência PDF → trilho **~9/11** da grade lógica (entre 4/6 e 5/6 de prosa); listas especiais mais estreitas (~76% do span prosa+rail).

Espaçamento completo: `docs/ESPACAMENTO-TIPOGRAFICO.md` / `--stack-*` em `tokens.css`.  
Bandeira → título país: `--stack-country-code` ≈ **9 mm**.

---

## 4. Cor — papéis semânticos

| Token | Hex | Uso |
|-------|-----|-----|
| Roxo | `#493975` | Marca, kicker, eixo suave |
| Roxo 2 | `#8146cb` | Header tabela, anos, labels perfil, UI — **não** H3 de miolo |
| Verde | `#0d6353` | Tag currículo, band-label, DimensionList, nomes ActorBand |
| Verde vivo | `#01c689` | **Só** linha/gráfico de trilho |
| Rosa | `#ef5ca1` | Tag organização |
| Laranja | `#ff8327` | **Só** bullet DetailList |
| Marfim | `#f3eee6` | Painel org, banda timeline, zebra, card perfil |
| Preto | `#000000` | Corpo + H2/H3 miolo |
| Muted / Folio | `#4a4a4a` | Legendadas, fólio |
| Regra | `#d9d2c8` | Fios discretos |

**Regra de ouro:** um acento por zona; sem tags CAPS inventadas; sem cor por país.

---

## 5. Grade — 6 colunas lógicas

Dentro da área útil:

- **Gutter:** 4,5 mm.
- **6 colunas** iguais: `(largura útil − 5×4,5 mm) / 6`.

| Layout | Prosa | Respiro | Rail |
|--------|-------|---------|------|
| `vozes-prose-only` | **9fr** (~82% útil) | gutter 4,5 mm | **2fr** livre |
| `vozes-with-rail` | **9fr** | gutter 4,5 mm | **2fr** aside (perfil, figura) |

Implementação: `--vozes-prose-track` / `--vozes-rail-track` em `vozes.css`; spans full-page (`MilestoneStrip`, `ActorBand`, `dual-track`) usam `--vozes-rail-to-prose`.

Intro dual-track: lede ~50% da área útil (span 3/6).

---

## 6. Componentes ↔ InDesign

| Peça | Comportamento |
|------|----------------|
| **CountryOpening** | Bandeira SVG **inline, só fills (sem stroke)**; H1 nome do país; sem H2 “O currículo…” |
| **PageStack** | Composição de página com bloco no rodapé (`vozes-page-stack-foot`) |
| **ActorBand** | `.band-label` verde caps + filete; nomes verdes; notas muted; corpo 10 pt à esquerda; **colunas de largura igual** |
| **DimensionList** | Cifras grandes verdes (`08`/`07`/`03`); títulos PT verdes; EN itálico verde; corpo preto; **sem** filetes |
| **DetailList** | Bullet verde; título verde em negrito; corpo 9 pt; recuo compacto. Agrupar com **DetailListGrid** (`columns={1\|2}`, `width="narrow\|full"`) quando houver lista após parágrafo introdutório — tokens `--vozes-detail-grid-width`, `--stack-before-detail-grid` |
| **MilestoneStrip** | Ano Slab roxo; **todas as datas numa dupla (2 págs.), nunca em 3** |
| **ProfileCard** | Marfim; foto circular; cargo itálico roxo 2; menos destaque que Highlight/Callout |
| **Figure** | Coluna prosa; `figure--compact` quando combinado; legenda 7,5 pt |
| **Tabela vozes** | Header Roxo 2 branco; zebra Marfim |
| **Dual-track** | Spread a/b; banda Marfim; eixo roxo; nós: ano → Currículo → Organização → **resumo**; ~4 nós/página; círculo 1,4 mm no eixo |

Cruzamentos: `content/timelines/*-cruzamento-*-{a,b}.json`, `variant: dual-track`.

### Austrália pp. 10–11 — FECHADO

Não redesenhar sem pedido explícito. Página 10: PageStack + prosa + ActorBand no rodapé. Página 11: “O que é nacional…” + três DimensionList + Figure `org-image13` compacta no rodapé. Propagar bandeiras/abertura aos outros países; **não** forçar DimensionList fora do padrão AU análogo.

---

## 7. Paginação e quebras

- Nova seção do manifesto → nova página.
- Órfãs/viúvas: mín. 3 linhas.
- Evitar quebra interna: figuras, tabelas, dual-track node, DetailList items, ProfileCard.
- Título + primeiro parágrafo juntos.
- Sem running heads no PDF Vozes; fólio cinza.

---

## 8. Arquivos do pacote / repo

| O quê | Onde |
|-------|------|
| Pacote handoff | `editorial-design/handoff-indesign/` |
| Prompt outro agente | `handoff-indesign/PROMPT-AGENTE-CURSOR.md` |
| Regras fechadas | `handoff-indesign/REGRAS-FECHADAS.md` |
| Manifesto | `content/document.json` |
| Capítulos | `content/chapters/*.mdx` |
| Cruzamentos | `content/timelines/*.json` |
| CSS = spec | `src/styles/tokens.css`, `vozes.css`, `paged.css` |
| Fontes | `assets/fonts/` (Mulish + Roboto Slab) |
| Mídia | `assets/media/` |
| Workflow agentes | `.cursor/rules/vozes-editorial-workflow.mdc` |
| Briefing externo | `…/Mapeamento-Organizacoes-Lemann-Vozes/01_Briefing/DECISOES.md` (se existir) |
| INDD piloto | `…/03_InDesign/` (se existir) |

---

## 9. Prioridades no InDesign

1. Estilos de parágrafo/objeto a partir desta diretriz + `ESPACAMENTO-TIPOGRAFICO.md`.
2. Grade 6 cols; prosa 3 + ar 1 + rail 2.
3. Hierarquia de cor atualizada (H3 preto; band-label verde).
4. Dual-track com **resumo após organização**; marcadores sem cobrir anos.
5. Respeitar AU pp. 10–11 fechadas.
6. Usar o **PDF digital** do pacote como prova — não o scroll do modo edição.

---

## 10. Escopo do handoff InDesign

Continuidade no kit = **InDesign** + PDF de prova. Prévia Vivliostyle, npm e regeneração de PDF do pipeline web ficam no repo React — não no prompt do agente InDesign. Commit/push só sob pedido explícito.

---

*Atualizado 11/nov/2026 — handoff InDesign (sem vocabulário de prévia web).*
