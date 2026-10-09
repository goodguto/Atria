# Atria — Spring Boot + HTML/CSS/JS

Primeiro incremento da trilha **S1-BACK/FRONT**, usando o protótipo inicial como referência visual e de fluxo.

## O que já está implementado

### Front-end
- estrutura visual do dashboard;
- layout base com sidebar e área principal;
- navegação entre Home, CAT, Riscos, Conexões e ESG usando hash routing;
- componentes reutilizáveis renderizados por JavaScript (alerta, titular, conexão, evidência);
- busca de titulares por nome, CPF ou e-mail;
- perfil de titular e fluxo de purga;
- Hub de Conexões consumindo o backend;
- painel de evidências ESG;
- calendário e estados de feedback;
- layout responsivo básico.

### Back-end
- projeto Spring Boot/Maven;
- servidor configurado na porta `8080` (ou variável `PORT`);
- API REST para dashboard, titulares, solicitações, conexões, purga, evidências e relatórios;
- tratamento básico de erros;
- dados mockados em memória para permitir desenvolvimento do front antes do banco de dados definitivo.

## Estrutura

```text
src/main/java/br/com/atria/
├── AtriaApplication.java
├── controller/
│   ├── ApiController.java
│   └── ApiExceptionHandler.java
├── dto/
│   ├── DashboardResponse.java
│   └── PurgaResponse.java
├── model/
│   ├── Conexao.java
│   ├── Evidencia.java
│   ├── Interacao.java
│   ├── Solicitacao.java
│   └── Titular.java
└── service/
    └── AtriaService.java

src/main/resources/
├── application.properties
└── static/
    ├── index.html
    ├── css/style.css
    ├── js/app.js
    └── img/Logo.png
```

## Endpoints iniciais

| Método | Rota | Uso |
|---|---|---|
| GET | `/api/health` | status da aplicação |
| GET | `/api/dashboard` | resumo da Home |
| GET | `/api/titulares?query=` | lista/busca de titulares |
| GET | `/api/titulares/{id}` | perfil do titular |
| POST | `/api/titulares/{id}/purga` | executa a purga simulada e gera evidência |
| GET | `/api/solicitacoes` | solicitações pendentes |
| GET | `/api/conexoes` | integrações disponíveis |
| POST | `/api/conexoes/{slug}/conectar` | conecta uma plataforma |
| GET | `/api/evidencias` | histórico ESG |
| GET | `/api/relatorios/{tipo}` | relatório inicial (`esg`, `anpd`, `comercial`) |

## Como executar

Pré-requisitos: Java 17+ e Maven 3.9+.

```bash
mvn spring-boot:run
```

Abra:

```text
http://localhost:8080
```

Teste rápido da API:

```bash
curl http://localhost:8080/api/health
```

## Próximos incrementos sugeridos

1. substituir o armazenamento em memória por JPA + banco definido pela trilha S1-DADOS;
2. criar entidades persistentes e migrations;
3. autenticação/autorização;
4. geração real de PDF para recibos e relatórios;
5. integração real com plataformas externas;
6. testes de serviço e integração mais completos.
