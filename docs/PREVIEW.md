# Prévia e PDF

O relatório é um site. A prévia é esse site. O PDF é a impressão dele, gerada só quando for preciso.

## Ver o relatório

```bash
npm run dev
```

Abra **http://127.0.0.1:5173**. Cada seção é uma folha. Salvar atualiza na hora.

`npm run visualizar` e `npm run editar` abrem o mesmo site.

## PDF final

```bash
npm run build
```

Valida o manuscrito, gera o site e grava `output/document-digital.pdf` (A4). A primeira execução pode demorar se o navegador do Playwright ainda não estiver instalado:

```bash
npx playwright install chromium
```

Para a versão com sangria (sem marcas de corte): `npm run pdf:print` → `output/document-print.pdf`.

## Resumo

| Objetivo | Comando | Destino |
| --- | --- | --- |
| Prévia (site) | `npm run dev` | http://127.0.0.1:5173 |
| PDF digital | `npm run build` | `output/document-digital.pdf` |
| PDF com sangria | `npm run pdf:print` | `output/document-print.pdf` |
