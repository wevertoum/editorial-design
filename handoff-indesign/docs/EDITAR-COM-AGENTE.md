# Editar o relatório no Cursor

Você fala **o que quer ver no documento**. O agente implementa e, quando precisar, sobe a prévia ou gera o PDF por você. **Não precisa abrir terminal nem lembrar comandos.**

---

## Três frases que cobrem quase tudo

| Você diz | O que acontece |
| --- | --- |
| **Visualizar** (ou “abre a prévia”, “quero ver as páginas”) | O agente deixa o relatório no modo **páginas de livro** (como no PDF). No navegador: **http://127.0.0.1:13000** — folhas em spread, numeração. |
| **Entrar no modo de edição** (ou “só quero ver o texto rápido”) | Prévia **sem paginação**, mais rápida para ler e revisar texto. **http://127.0.0.1:5173** |
| **Gerar renderização PDF** (ou “gera o PDF”, “exporta o PDF final”) | O agente gera o arquivo para enviar: `output/document-digital.pdf`. Para gráfica com sangria e marcas de corte, diga **“PDF para gráfica”**. |

Depois de cada alteração de conteúdo ou layout, pode pedir de novo: **“visualizar”** e ir até o país ou seção que mudou.

---

## Como pedir mudanças (exemplos reais)

Use país ou parte do relatório: “na Austrália”, “no resumo”, “na capa”, “na linha do tempo do Chile”.

| O que você quer | Exemplo |
| --- | --- |
| Texto | “Na apresentação, troca o segundo parágrafo por: …” |
| Imagem | “Adiciona essa imagem depois do primeiro parágrafo da Austrália.” *(anexe o arquivo)* |
| Infográfico | “Gera esse infográfico na parte dos EUA com estes números: …” |
| Margens / fólio | “Alinha o conteúdo com as margens laterais.” / “Centraliza a numeração das páginas.” |
| Links | “Deixa os links clicáveis e fáceis de reconhecer.” |
| Caixas | “Padroniza os boxes de destaque.” |
| Perfis | “Os boxes de perfil com menos destaque que os outros.” |
| Foto de perfil | “Foto em moldura redonda, estilo dual tone.” |
| Capa | “Aumenta o logo na capa.” |
| Texto novo do time | “Atualizou o Mapeamento — traz para o relatório.” |

**Não precisa mencionar:** bundle, validate, npm, MDX, build digital, etc.

---

## O que você deve ouvir do agente

- O que mudou, em português de editor (não lista de arquivos).
- **“Visualize em http://127.0.0.1:13000 e vá até …”** (capa, Apresentação, Austrália, …).
- Se pediu PDF: **caminho do arquivo** e confirmação de que a renderização terminou.

---

## O que fica fixo até você pedir mudança

Tudo o que já combinamos — perfis com foto, destaque de nome na governança, margens, capa, caixas, links, imagens — **não é desfeito** sozinho. Só muda se **você pedir** de novo (por exemplo “volta o texto antigo” ou “tira o destaque do nome”).

Se trouxer texto novo do Mapeamento, o agente atualiza o conteúdo **sem jogar fora** o desenho que já estava certo. Se algo sumir na prévia, diga: **“isso não pode ser perdido — restaura como estava.”**

---

## Anexar imagem

Arraste para o chat + diga onde entra (país, antes/depois de qual título).

---

## Se a prévia não atualizar

Diga: **“A prévia não mudou — visualiza de novo e confere.”**  
Ou atualize a página do navegador (F5) se a prévia já estiver aberta.

---

## Referência opcional (só se o agente pedir para você clicar)

| Pedido seu | Atalho interno do projeto (agente usa) |
| --- | --- |
| Visualizar | `npm run visualizar` (= prévia paginada) |
| Modo de edição | `npm run editar` |
| Gerar renderização PDF | `npm run gerar-pdf` |
| PDF para gráfica | `npm run gerar-pdf-grafica` |

Você **não precisa** digitar isso; o agente faz quando você pede visualizar ou gerar PDF.
