# Espaçamento e estilos de bloco — Relatório Vozes

Referência editorial alinhada ao CSS (`src/styles/tokens.css`, `document.css`, `vozes.css`). Os valores **não mudam no Word/MDX**: o agente ou o CSS aplicam o ritmo vertical.

---

## Escala base

| Nome | Valor | Papel |
|------|-------|--------|
| space-1 | 2 mm | Respiro curto (abaixo de H3, kicker, itens de lista detalhe) |
| space-2 | 4 mm | Abaixo de H2 |
| space-3 | 6 mm | Abaixo de H1 |
| space-4 | 8 mm | Blocos destacados (caixa, tabela, citação) |
| space-5 | 12 mm | Acima de H2/H3 no specimen; acima de H3 no Vozes |

---

## Estilos de texto + respiro

### Corpo e listas (Vozes)

| Estilo | Fonte | Tamanho | Espaço **depois** |
|--------|-------|---------|-------------------|
| Parágrafo | Mulish | 10 pt | 0,92 em entre parágrafos (~3,2 mm) |
| Item detalhe (bullet laranja) | Mulish | 10 pt | 2 mm entre itens |
| Lead do país | Mulish | 10 pt | Mesmo ritmo que parágrafo |

### Títulos (miolo Vozes)

| Estilo | Fonte | Antes | Depois | Perfil |
|--------|-------|-------|--------|--------|
| Código do país (AU, BR…) | Mulish 9 pt caps | — | 2 mm | Abertura |
| **H1** país | Roboto Slab 28 pt | — | **6 mm** | Abertura |
| Bloco abertura (código + H1 + lead) | — | — | **5,5 mm** após o bloco | Abertura |
| **H2** seção (1. O currículo…) | Mulish 13 pt bold | **6,5 mm** | **4 mm** | Corpo |
| **H2** primeira da página (apresentação / resumo) | idem | **0** | 4 mm | Front matter |
| **H3** subseção (1.1. …) | Mulish 11 pt, Roxo 2 | **12 mm** | **2 mm** | Corpo |
| Título org (`org-section-title`) | = H2 ou H3 | = nível | = nível | Organizações |

**Regra de leitura:** o respiro **antes** de H2/H3 marca nova seção; o respiro **depois** do título cola o primeiro parágrafo sem “buraco” grande (4 mm ou 2 mm).

### Rótulos (outros layouts)

| Estilo | Depois |
|--------|--------|
| Kicker (caps roxo) | 2 mm |

---

## Blocos e componentes

| Componente | Antes | Depois | Não partir no PDF |
|------------|-------|--------|-------------------|
| Figura (Vozes) | 4,5 mm | 4,5 mm | Sim |
| Figura (specimen) | 8 mm | 8 mm | Sim |
| Legenda da figura | — | 1,5 mm abaixo da imagem | — |
| Caixa destaque (`HighlightBox`) | 8 mm | 8 mm | Sim |
| Título dentro da caixa | — | 2 mm | — |
| Citação lateral (`PullQuote`) | 8 mm | 8 mm | Sim |
| Tabela editorial | 8 mm | 8 mm | Sim |
| Card de perfil | 10 mm | (fluxo) | Sim |
| Callout / facts no rail | 5 mm | (fluxo) | Sim |
| Faixa de marcos (`MilestoneStrip`) | 8 mm | 8 mm | — |

---

## Combinações frequentes (o que o editor vê)

| Sequência | Respiro aproximado |
|-----------|-------------------|
| H1 país → lead / parágrafo | 6 mm |
| Parágrafo → parágrafo | ~3,2 mm |
| Parágrafo → H2 | ~3,2 mm + 6,5 mm |
| H2 → parágrafo | 4 mm (título “gruda” no texto; PDF evita quebra entre eles) |
| Parágrafo → figura | fim do parágrafo + 4,5 mm |
| Parágrafo → card de perfil | fim do parágrafo + 10 mm |

---

## Paginação (PDF e visualizador paginado)

- Nova **seção** do relatório = nova página.
- **Título + primeiro parágrafo** da mesma seção ficam na mesma página quando possível.
- Figuras, caixas, perfis e tabelas **não são cortados** ao meio.

---

## Onde ajustar (equipe técnica)

Todos os tokens `--stack-*` estão em `src/styles/tokens.css`. Alterar um token (ex.: `--stack-before-h2-vozes`) atualiza o PDF e as prévias sem editar capítulo por capítulo.

Handoff InDesign: ver também `docs/DIRETRIZ-VISUAL-INDESIGN.md` (tipografia e cor).
