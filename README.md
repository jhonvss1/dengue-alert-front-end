# Alerta Dengue — front-end

Aplicação Angular que mostra a situação semanal de **dengue, chikungunya e zika** em qualquer município do Brasil,
consumindo a [dengue-alert-api](https://github.com/jhonvss1/dengue-alert-api).

## Funcionalidades

- Busca de município por nome, com filtro opcional por estado (autocomplete com navegação por teclado).
- Cartões com a semana mais recente de cada doença e seu nível de alerta (baixo, moderado, alto, crítico).
- Gráfico e tabela do histórico semanal da doença selecionada, com período de 4, 12, 26 ou 52 semanas.
- Link compartilhável: `/cidade/3106200?disease=zika&weeks=26`. A última cidade consultada é lembrada.
- Avisos de primeira consulta demorada, dados desatualizados e erros da API; tema claro/escuro e layout responsivo.

## Desenvolvimento

Requisitos: Node 18+ e a API rodando (veja o README dela).

```bash
npm ci
npm start            # http://localhost:4200, API esperada em http://localhost:5270
npm test             # testes (Karma/Jasmine)
npm test -- --watch=false --browsers=ChromeHeadlessCI   # sem interface, para CI
```

A URL da API fica em `src/environment/environment.ts` (desenvolvimento) e `environment.prod.ts` (produção,
substituído automaticamente no `npm run build`).

## Deploy no Cloudflare Pages

Em *Workers & Pages → Create → Pages → Connect to Git*, escolha este repositório e configure:

| Campo | Valor |
|---|---|
| Production branch | `main` |
| Build command | `npm ci && npm run build` |
| Build output directory | `dist/dengue-alert-api-front-end` |
| Variável de ambiente | `NODE_VERSION` = `20` |

Depois, em *Custom domains*, adicione `dengue.brago.com.br` (a Cloudflare cria o registro DNS automaticamente).
Sem arquivo `404.html`, o Pages já responde `index.html` para rotas desconhecidas, o que faz as rotas do Angular
funcionarem ao abrir/atualizar `/cidade/...`.

Na API, libere essa origem no CORS (`CORS_ORIGIN=https://dengue.brago.com.br`).

## Estrutura

```
src/app/
├── city/
│   ├── city-page/       página da cidade (carga, filtros, erros)
│   ├── city-search/     autocomplete de município
│   ├── alert-summary/   cartões por doença
│   └── weekly-chart/    gráfico de barras semanal
├── model/               tipos da API, doenças e níveis de alerta
├── services/            AlertsApiService (HTTP)
└── utils/               datas em UTC e rótulo de semana
```
