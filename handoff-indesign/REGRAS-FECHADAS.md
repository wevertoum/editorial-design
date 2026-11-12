# Regras fechadas — não redesenhar sem pedido explícito

Extraído do workflow Vozes (nov/2026). No InDesign e em qualquer agente, **preservar** até a editora pedir mudança.

---

## Regra de ouro

Tudo o que já foi combinado — texto, componentes (ProfileCard, Figure, ActorBand, DimensionList, PageStack…), layout `vozes-with-rail`, tipografia, caixas, links, imagens, capa, margens — **permanece**.

- Não “simplificar” nem reverter por conveniência ou import em massa.
- Conteúdo novo do Mapeamento atualiza texto **sem** desfazer tratamento editorial.

---

## Austrália — dupla pp. 10–11 (FECHADA)

| Elemento | Tratamento |
|----------|------------|
| Abertura | Bandeira AU SVG **inline, só fills (sem stroke/borda)**; título **Austrália**; espaço generoso bandeira→título (~9 mm) |
| Sem H2 | **Não** usar “O currículo australiano” (o nome do país já basta) |
| H3 | Pretos em todo o relatório; `.band-label` permanece verde |
| Página 10 | PageStack + prosa + ActorBand no rodapé |
| ActorBand | band-label caixa alta verde + filete; nomes verdes; notas muted; corpo à esquerda (sem justify); **colunas de largura igual** |
| Página 11 | “O que é nacional…” + três DimensionList + Figure `org-image13` compacta no rodapé |
| DimensionList | Cifras `08`/`07`/`03` verdes; títulos PT verdes; EN itálico verde; corpo preto; **sem** filetes |
| Processos | DetailList (Estruturar/Escrever…), **não** DimensionList |

**Propagação:** bandeiras US/GB/NG/CL; remoção do H2 “O currículo…”; PageStack+ActorBand no rodapé nas aberturas dos outros países. **Não** forçar DimensionList nem segundo PageStack de figura fora da composição australiana análoga.

---

## Dual-track (“Onde as trajetórias se cruzam”)

Ordem visual de cada nó:

1. Ano (Slab, roxo)
2. Currículo (tag verde)
3. Organização (tag rosa)
4. **Resumo / síntese** (depois da organização — padrão EUA)

Marcador: círculo pequeno no eixo da linha, **sem cobrir os dígitos do ano**.

Preferência: ~4 nós por página de spread; sínteses densas no CSS antes de cortar texto.

---

## MilestoneStrip

Ano em roxo (Slab) + marco; sem fundo/zebra de tabela. **Todas as datas em uma dupla (2 págs.), nunca em 3.**

---

## PDF / página

- Sem running heads.
- Fólio cinza `#4a4a4a`.
- `apresentacao` / `resumo-executivo` / capa: sem kicker no frontmatter.
- Capa: `sheetVariant: vozes-cover`.
