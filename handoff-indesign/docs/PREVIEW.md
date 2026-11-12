# Prévia e PDF

Dois comandos cobrem o fluxo editorial:

## Ver páginas, spreads e números (como impresso)

```bash
npm run dev
```

1. Gera o HTML estático (`build:digital`).
2. Abre o **visualizador Vivliostyle** com **spread** (duas páginas face a face quando couber).
3. Mostra **números de página** e cabeçalhos definidos em `src/styles/paged.css`.

O navegador costuma abrir em **http://127.0.0.1:13000**. O comando fica observando `content/`, `src/`, `assets/` e `vite.config.ts`: ao salvar, roda `build:digital` de novo e o visualizador recarrega a paginação (a primeira compilação pode demorar).

Se `dist/index.html` já existir e você só quiser reabrir o viewer:

```bash
npm run dev -- --no-build
```

## PDF final

```bash
npm run build
```

Valida o manuscrito, faz o build digital, e grava `output/document-digital.pdf` com a mesma paginação do Vivliostyle. A primeira execução pode demorar (download do Chromium do CLI).

## Edição rápida (opcional)

Para escrever e ajustar componentes com **hot reload**, sem paginação nem numeração:

```bash
npm run dev:edit
```

Abra **http://127.0.0.1:5173**. Folhas A4 contínuas por capítulo; não substitui `npm run dev` para conferir spreads.

## Resumo

| Objetivo | Comando | Destino |
| --- | --- | --- |
| Spreads + número de página | `npm run dev` | http://127.0.0.1:13000 |
| PDF digital | `npm run build` | `output/document-digital.pdf` |
| Hot reload (sem paginar) | `npm run dev:edit` | http://127.0.0.1:5173 |
