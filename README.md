![Logo](img/logo.png)

Protótipo web de plataforma para gestão de conformidade com a LGPD, voltado para lojistas de e-commerce. Permite centralizar dados de clientes espalhados em múltiplas plataformas e responder a solicitações de exclusão em poucos cliques.

---

## Telas

### Home
Visão geral do estado operacional. Contém:
- **Quadro de avisos** com alertas de solicitações pendentes (nome, e-mail, tipo e prazo)
- **Busca rápida** de titular que redireciona para a CAT
- **Atalhos de relatórios** (ESG, ANPD, Diferencial Comercial)
- **Calendário interativo** com navegação por mês

### CAT — Central de Atendimento ao Titular
Fluxo principal de atendimento a solicitações de dados. Possui duas sub-views:

**Lista de clientes**
- Busca por CPF ou e-mail
- Lista de titulares com dados básicos e botão de acesso ao perfil

**Perfil do cliente** (detalhe)
- Banner com dados cadastrais (nome, CPF, telefone, CEP, e-mail, gastos totais)
- Lista de plataformas onde os dados do titular foram detectados (WhatsApp, Instagram, TikTok, Nuvemshop, etc.)
- Histórico de interações com o cliente
- **Botão "Deletar todos os dados"** — executa a purga unificada com animação de progresso por plataforma
- Após a purga: área de confirmação com botão para baixar o recibo em PDF

### Riscos e Prazos
- Lista filtrável de alertas ativos com prazos
- **Status de Exposição ANPD** — indicador de conformidade com opção de expandir detalhes
- **Riscos de Marketplace** — painel verde com status de pendências em plataformas como Mercado Livre

### Hub de Conexões
- Lista de plataformas disponíveis para conectar: WhatsApp, Instagram, TikTok, Nuvemshop, Mercado Livre
- Clique no card simula autenticação via API com feedback visual (⏳ → ✅)
- Botão para adicionar nova plataforma

### ESG — Painel de Evidências
- Cabeçalho com geração de Relatório de Governança (Pilar G)
- Tabela de histórico de purgas realizadas com dados mascarados, plataformas varridas e status de certificação
- Novas entradas são inseridas dinamicamente após cada purga concluída

---

## Estrutura de arquivos

```
/
├── index.html   # Marcação completa das 5 telas e sub-views
├── style.css    # Design system com tokens CSS, componentes e utilitários
├── script.js    # Navegação entre seções, calendário, purga e lógica de UI
└── img/
    └── logo.png
```

---

## Como executar

Não há dependências ou build. Abra o `index.html` diretamente no navegador ou sirva localmente:

```bash
npx serve .
# ou
python3 -m http.server 8080
```

---

## Stack

- HTML5, CSS3 e JavaScript vanilla — sem frameworks ou bibliotecas externas
- Fonte: Inter via system font stack

---

## Navegação e fluxos implementados

| Ação | Comportamento |
|---|---|
| Clicar em "Visualizar" (alerta ou lista) | Abre o perfil do cliente na CAT diretamente |
| Busca na Home | Redireciona para a aba CAT |
| Busca na CAT | Abre o detalhe com o termo buscado |
| "Deletar todos os dados" | Anima status de cada plataforma, esconde botão e exibe área de recibo |
| Clicar em card do Hub | Simula autenticação com delay e feedback visual |
| Calendário | Navegação por mês, seleção de dia com destaque visual |
| Painel ANPD / Marketplace | Botão ⤢ expande informações adicionais |