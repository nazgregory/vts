# Data Visualization Tool (Deployment Source)

<p align="center">
  <a href="./README.md">한국어</a> | <a href="./README.en.md">English</a>
</p>

[![version](https://img.shields.io/badge/version-1.0.0-blue)](./package.json)
[![license](https://img.shields.io/badge/license-MIT-green)](./LICENSE.md)
[![node](https://img.shields.io/badge/node-%3E%3D18-339933?logo=nodedotjs&logoColor=white)](./package.json)
[![react](https://img.shields.io/badge/react-18.2.0-149ECA?logo=react&logoColor=white)](./package.json)
[![plotly.js](https://img.shields.io/badge/plotly.js-2.27.0-3D4C73)](./public/vendor/plotly-2.27.0.min.js)
[![leaflet](https://img.shields.io/badge/leaflet-1.9.4-199900)](./package.json)
[![typescript](https://img.shields.io/badge/typescript-5.9.2-3178C6?logo=typescript&logoColor=white)](./package.json)
[![vite](https://img.shields.io/badge/vite-4.5.14-646CFF?logo=vite&logoColor=white)](./package.json)
[![express](https://img.shields.io/badge/express-4.18.2-000000?logo=express&logoColor=white)](./server/package.json)
[![prisma](https://img.shields.io/badge/prisma-5.7.1-2D3748?logo=prisma&logoColor=white)](./server/package.json)

## About

![Demo](./docs/demo.mp4){width=960}
<p align="center">
  <a href="https://vts.seocho.go.kr">Try it : Visualization Tools</a>
</p>

This is an open-source web platform for understanding and using complex data through charts.

Data visualization helps people communicate information and make decisions, but building charts usually requires data-processing skills and a specialized tool. Seocho-gu built this service so that people can create charts without that specialized knowledge.

Upload a CSV or Excel file to create one of 21 chart types, adjust colors and layout, and download the finished chart as an image for reports and presentations.

The project is published so that other local governments, public agencies, and developers can reuse the source and adapt it to their own environment.

## Features

- CSV and Excel upload
- 21 chart types for different kinds of data and questions
- Customization of color, layout, and other design settings
- Image download for reports and presentations
- A visualization gallery of chart examples

![Gallery](./docs/gallary.mp4){width=960}

## Open-source use

This repository is a standalone source snapshot. Other organizations can build and operate the service in their own environment.

You may modify and extend it for your own systems. Additional design and development may be required for security and independent operation.

The project license is MIT. License notices for Plotly, Leaflet, and React are kept separately in `LICENSE.md`.

## Project information

| Item | Detail |
| --- | --- |
| Organization | Seocho-gu Office, Seoul |
| Team | Smart City Division, AI and Big Data Team |
| License | MIT License (`LICENSE.md`) |
| Stack | React, Plotly, Leaflet, Node.js, PostgreSQL |
| Runtime | Node.js 18 or later, npm 9 or later, PostgreSQL 13 or later |
| Phone | 02-2155-6089 |
| Email | irize@seocho.go.kr |

Plotly, Leaflet, React, and other third-party libraries keep their own licenses. Check those terms before reuse or redistribution.

## Layout

```
migration/
├── src/                  Frontend (React 18 + TypeScript + Vite)
├── public/sample_data/   Sample CSV and XLSX for each chart
├── public/vendor/        Plotly 2.27.0 and Leaflet marker images
├── server/               Usage-history API (Express + Prisma)
│   ├── src/
│   ├── prisma/           Schema and migrations
│   └── env.example
├── deploy/
│   ├── nginx.conf        Example static files and /api proxy
│   └── pm2.config.cjs    Example backend process (no secrets)
├── json/, md/            Reference notes aligned with the code
├── .env.example          Frontend environment template
└── index.html
```

Chart groups follow `src/components/ChartTypeSelector.tsx`.

- Comparison and trend (4): line, stacked area, bar, stacked bar
- Ratio and composition (4): pie, donut, sunburst, treemap
- Distribution and relation (4): scatter, bubble, histogram, box plot
- Special analysis (4): radar, timeline, gauge, word cloud
- Advanced analysis (4): heatmap, waterfall, combo, panel
- Map (1)

Most charts are drawn with `public/vendor/plotly-2.27.0.min.js`. Map, gauge, word cloud, and timeline are drawn by `MapChart`, `GaugeChart`, `WordCloudChart`, and `TimelineChart`. The sample button downloads XLSX. On-screen guidance reads the CSV file of the same name. The upload limit is 10MB and is fixed in `src/utils/dataParser.ts`.

## Run locally

Prepare a PostgreSQL database and account in your own environment. The app reads only the connection string in `DATABASE_URL` inside `server/.env`.

### 1. Backend

```powershell
cd server
copy env.example .env
# Edit DATABASE_URL, IP_SALT, and ALLOWED_ORIGINS in .env
npm install
npx prisma migrate deploy
npm run dev
```

The backend listens at `http://localhost:3001`.

`ALLOWED_ORIGINS` lists browser origins only. For local use, set `http://localhost:3000`. Add other origins, separated by commas, when the deployed site uses a different origin.

APIs:

- `POST /api/session/start`
- `POST /api/session/validate`
- `POST /api/collect` (at most 200 events per request)
- `POST /api/satisfaction-ratings`

Health check: `GET /health`. See `md/backend_architecture_summary.md` for the table.

### 2. Frontend

```powershell
cd ..
copy .env.example .env
npm install
npm run dev
```

The site is at `http://localhost:3000`. The dev server proxies `/api` to `VITE_API_SERVER_HOST` and `VITE_API_SERVER_PORT` from `.env`.

## Deploy

```powershell
# Build the frontend after setting the API host in .env
npm run build

# Build the backend
cd server
npm install
npx prisma generate
npm run build
npx prisma migrate deploy
```

- Place the frontend output, `dist/`, in the Nginx `root`. See `deploy/nginx.conf`.
- The backend reads `server/.env`. The PM2 example is `deploy/pm2.config.cjs`. Start it from the project root.

```bash
pm2 start deploy/pm2.config.cjs
pm2 save
```

When Nginx serves the site, point `.env` at the same origin so the browser calls `/api` there.

```
VITE_API_SERVER_HOST=your-host
VITE_API_SERVER_PORT=80
VITE_API_PROTOCOL=http
```

Vite reads these values at build time. Run `npm run build` again after changing them.

## Closed networks

The chart library and map marker images are in `public/vendor/`. The UI uses fonts already installed on the system, so the chart screens open without the public internet.

Maps need two extra checks.

- Background tiles: set `VITE_MAP_TILE_URL` in `.env` to your tile server. The URL must contain `{z}`, `{x}`, and `{y}`. If the value is empty, the app uses OpenStreetMap and Carto, which need outbound internet. Markers still appear when coordinates exist and tiles cannot be loaded.
- Location: if the data has `위도` and `경도` columns, those values are used. Address-only data needs the Kakao Local API. Issue a REST API key in the [Kakao developers console](https://developers.kakao.com) and put it in `.env`.

```
VITE_KAKAO_REST_API_KEY=your_rest_api_key
VITE_MAP_TILE_URL=https://tiles.example.go.kr/{z}/{x}/{y}.png
```

Vite reads these values at build time. Run `npm run build` again after changing them.

## Reference docs

Files in `json/` and `md/` are descriptions. They are not loaded at runtime, except the color palette JSON, which `src/utils/colorPalettes.ts` reads. Chart groups follow `ChartTypeSelector.tsx`. The server description follows `server/src` and `server/prisma/schema.prisma`.

## Before you reuse this source

- Each organization creates its own `.env` and `server/.env`. Do not commit them.
- The contact line at the bottom of the screen is Seocho-gu's. Change the text in `src/components/VisualizationDashboard.tsx` for your organization.

## Not included

- AI chart recommendation, the message feature, admin statistics, and user tracking
- Server accounts, passwords, SSH keys, and database passwords
- `node_modules` and frontend or backend build output
- Scripts that copy files onto a specific virtual machine
