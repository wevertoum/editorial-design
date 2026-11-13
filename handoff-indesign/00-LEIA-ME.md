# Handoff InDesign — pronto para usar

Pacote gerado a partir do repo `editorial-design` (Relatório Vozes / Levantamento Organizações 2026).

**Você não precisa montar nada.** Use esta pasta como kit.

---

## O que abrir agora

1. **Prova de páginas:** `prova/document-digital.pdf`  
   Espelho paginado A4 (referência visual e de quebras).
2. **Diretriz visual:** `docs/DIRETRIZ-VISUAL-INDESIGN.md`  
   Trim, margens, tipografia, cores, grade, componentes ↔ InDesign.
3. **Espaçamento:** `docs/ESPACAMENTO-TIPOGRAFICO.md`
4. **Regras fechadas (não redesenhar):** `REGRAS-FECHADAS.md`  
   Inclui Austrália pp. 10–11 e padrão dual-track.
5. **Prompt para outro Cursor:** `PROMPT-AGENTE-CURSOR.md`  
   Copie o bloco inteiro e cole num chat novo (Agent mode) focado em **InDesign**.  
   O prompt **não** inclui prévia Vite, npm do repo web, regenerar PDF nem commit/push.

---

## Pastas do kit

| Pasta | Conteúdo |
|-------|----------|
| `prova/` | PDF digital A4 atualizado |
| `docs/` | Diretriz, espaçamento, guia da editora |
| `content/` | `document.json` + capítulos MDX + timelines JSON (texto na ordem do livro) |
| `assets/fonts/` | Mulish + Roboto Slab (instalar no sistema / INDD) |
| `assets/media/` | Figuras e logo usados no relatório |
| `styles/` | `tokens.css`, `vozes.css`, `paged.css`, etc. (spec tipográfica) |
| `regras/` | Cópia do workflow de agentes + AGENTS.md |

---

## Ordem do livro

Arquivo: `content/document.json` → lista `sections` (capa, expediente, países, cruzamentos…).

Capítulos flow: `content/chapters/*.mdx`  
Cruzamentos dual-track: `content/timelines/*-cruzamento-*.json`  
Campos do nó: `year`, `curriculo`, `organizacao`, `resumo` (síntese **depois** da organização).

---

## InDesign (checklist mínimo)

1. Documento A4; margens conforme diretriz (alinhar topo 70 pt se DECISOES pedir).
2. Instalar fontes de `assets/fonts/`.
3. Criar estilos de parágrafo/objeto a partir da diretriz (corpo 10/1,41 Mulish; H1 Slab 28; H2 13 preto; H3 11 preto; band-label verde).
4. Grade 6 colunas; prosa 3/6 + ar 1/6 + rail 2/6.
5. Colocar mídia de `assets/media/` conforme capítulos.
6. Dual-track: Currículo → Organização → resumo; círculos pequenos no eixo, sem cobrir anos.
7. Não alterar a composição fechada da Austrália pp. 10–11 sem pedido explícito.

Piloto / briefing externos (opcional — **não encontrados** nesta máquina em 11/nov/2026):

- `~/Documents/Mapeamento-Organizacoes-Lemann-Vozes/01_Briefing/DECISOES.md`
- `~/Documents/Mapeamento-Organizacoes-Lemann-Vozes/03_InDesign/`

Se você tiver esses arquivos noutro disco, copie-os para dentro de `handoff-indesign/externo/` e avise o agente.

**Zip do kit inteiro:** `editorial-design/handoff-indesign.zip` (mesma pasta do repo).

---

## Outro agente Cursor

1. Abra esta pasta `handoff-indesign` (ou o repo) no workspace.
2. Cole o conteúdo de `PROMPT-AGENTE-CURSOR.md` como primeira mensagem.
3. Peça: continuar diagramação no **InDesign** preservando o combinado; usar o PDF de `prova/` como referência.
4. Não peça ao agente “visualizar”, “gerar PDF” do pipeline web, nem commit/push — isso ficou no repo React, não neste handoff.

---

*Gerado automaticamente — 11/nov/2026.*
