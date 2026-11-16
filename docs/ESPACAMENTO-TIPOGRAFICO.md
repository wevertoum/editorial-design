# Espaçamento e estilos de bloco — Relatório Vozes

Referência editorial alinhada ao CSS (`src/styles/tokens.css`, `document.css`, `vozes.css`). Os valores **não mudam no Word/MDX**: o agente ou o CSS aplicam o ritmo vertical.

---

## Unidade de ritmo (U)

**1U = 2 mm** (`--vozes-rhythm-u` / `--space-1`).

| Nível | mm |
|-------|-----|
| 1 | 2 |
| 2 | 4 |
| 3 | 6 |
| 6 | 12 |

Tokens semânticos (`--gap-*`) em `tokens.css` derivam desta escala.

---

## Esquema combinado (miolo)

| Situação | Proporção | Token |
|----------|-----------|--------|
| Entre parágrafos | 1U | `--gap-paragraph` / `--stack-paragraph-vozes` |
| Entre parágrafo e box / bullets / faixa | 2U | `--gap-paragraph-to-block` |
| Entre subtítulo (H3) e texto | 1U | `--gap-h3-after` / `--stack-after-h3` |
| Entre título (H2) e texto | 2U | `--gap-h2-after` / `--stack-after-h2` |
| Título macro do país (H3) → texto | 6U | `.country-opening + h3` (`--gap-country-to-macro`) |
| Título do país → 1.º subtítulo macro | 6U | `--gap-country-to-macro` |
| Caixa trajetória — padding | 1U | `--gap-trajetoria-padding` |
| Caixa “Canais de participação” — padding inferior | 4U (8 mm) | `participation-box--compact` — todas as ocorrências (pp. 12, 27, 36, 42) |
| Caixa trajetória — título → marcos | 1U | `--gap-trajetoria-title-body` |
| Caixa trajetória — entre marcos (datas) | 2U | `--gap-trajetoria-milestone` |
| Cruzamento — eixo → parágrafos | 1U | `--gap-dual-axis-body` |
| Cruzamento — entre parágrafos no cartão | 1U | `--gap-dual-body-paragraph` |
| Cruzamento — entre fileiras de períodos | 3U | `--gap-dual-matrix-row` |

**Antes de H3** (nova seção no fluxo): mantém **6U** (`--stack-before-h3` / 12 mm), salvo o 1.º H3 logo após a abertura do país (só os **6U** de `--gap-country-to-macro`).

### Regra de não somar

O respiro antes de um H3 é **um só**. Quando o H3 vem depois de um parágrafo, grelha, caixa ou faixa, o bloco anterior **não** soma a sua margem:

| Sequência | Total | Como |
|-----------|-------|------|
| parágrafo → H3 | 6U | `p:has(+ h3)` com `margin-bottom: 0` |
| H2 (título da organização) → H3 | 6U | `h2 + h3` com `margin-top: 2U` (H2 já tem 2U abaixo) |
| grelha → H3 | 6U | `grelha + h3` com `margin-top: 2U` (grelha mantém 4U abaixo) |

Em pilhas `flex`/`grid` as margens não colapsam; estas regras garantem o mesmo resultado do fluxo normal.

**Figuras e tabelas** são blocos grandes (4U = 8 mm): o parágrafo anterior não soma 1U (`p:has(+ figure/table)` com `margin-bottom: 0`).

**Topo da folha:** o miolo começa sempre a 18 mm. O primeiro bloco de cada `PageStack` (ou da folha) não tem margem superior própria.

---

## Exceções editoriais (não generalizar)

| Onde | Tratamento |
|------|-----------|
| Resumo executivo pp. 8–9 | Caixas dos achados com respiro duplicado (título→texto 3U; entre caixas 4U) — pedido da editora |
| Abertura de país — faixa de atores | A faixa mantém o respiro de secção próprio (7 mm + 2U do parágrafo); na p. 10 o respiro interno é ampliado (ícone→título 4 mm, título→subtítulo 2 mm, subtítulo→texto ≈4,5 mm) |
| Abertura de país — título “O sistema curricular…” | 6U antes e 6U depois, como o título da fundação → subtítulo (p. 14); na p. 40 a faixa de atores absorve 2 mm para o pé fechar |
| Expediente p. 2 / aberturas p. 7–8 | Ritmo de front matter (título display + 6U antes do texto) |
| CON p. 37, Reimagina pp. 44–45 | Folhas em capacidade máxima: ritmo compacto (secções a 3U/6 mm, parágrafos a 1,5–2 mm) para não invadir a margem inferior; texto e ordem intactos |
| Austrália p. 12 — quatro fases | Introdução → bullets 4U (8 mm); entre fileiras 4U (8 mm) — pedido da editora |

### Rabos de linha

Nenhum bloco pode ficar com última linha muito curta. O ajuste é tipográfico, dentro do texto existente:

| Ferramenta | Limite |
|------------|--------|
| `letter-spacing` | no máximo ±0,015 em (+15 / −15 milésimos de em) |
| Hifenização (`hyphens`) | só para evitar a última linha curta; nunca deixar fragmentos de 1–2 letras |
| `text-wrap: balance` | preferir nas colunas estreitas: equilibra as linhas sem mexer no texto nem na altura do bloco |

As quatro fases da p. 12 usam quebra equilibrada e `hyphens: manual` (o dicionário pt-BR partia “currículo” e “consultivos” em fragmentos de 2 letras); a altura da grelha não muda.

---

## Escala base (legado)

| Nome | Valor | Papel |
|------|-------|--------|
| space-1 | 2 mm | 1U |
| space-2 | 4 mm | 2U |
| space-3 | 6 mm | 3U |
| space-4 | 8 mm | Blocos grandes |
| space-5 | 12 mm | 6U — acima de H2/H3 |

---

## Onde ajustar (equipe técnica)

Alterar **um** token `--gap-*` ou `--vozes-rhythm-u` em `tokens.css` propaga ao PDF e à prévia. Evitar novos overrides de `--stack-paragraph-vozes` por folha em `vozes.css`.

Handoff InDesign: ver também `docs/DIRETRIZ-VISUAL-INDESIGN.md`.