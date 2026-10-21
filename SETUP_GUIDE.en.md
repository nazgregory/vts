# Data Visualization Tool — Tracking System Setup Guide

[한국어](./SETUP_GUIDE.md)

> How to configure and run IP-based usage tracking

## Contents

1. [Requirements](#requirements)
2. [Backend](#backend)
3. [Frontend](#frontend)
4. [Database](#database)
5. [Environment variables](#environment-variables)
6. [Run and test](#run-and-test)
7. [Troubleshooting](#troubleshooting)

## Requirements

### Required software

- **Node.js**: >= 18.0.0
- **npm**: >= 9.0.0
- **PostgreSQL**: >= 13.0
- **Git**: a current release

### Suggested capacity

- **RAM**: 4GB or more
- **Disk**: 2GB or more
- **Network**: an internal network is enough for charts. Map address search uses the Kakao API, and the default map background uses the public internet.

## Backend

### 1. Enter the server directory

```bash
cd server
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment file

```bash
cp env.example .env
```

On Windows PowerShell:

```powershell
copy env.example .env
```

Edit `.env`:

```env
# Database
DATABASE_URL="postgresql://postgres:password@localhost:5432/visualization_tracking"

# Security
IP_SALT="your-secure-random-salt-string-here"
ALLOWED_ORIGINS="http://localhost:3000"

# Server
PORT=3001
NODE_ENV="development"

# Tracking
BATCH_MAX=200

# Logging
LOG_LEVEL="info"
```

### 4. Create the database schema

```bash
# Generate the Prisma client
npm run db:generate

# Apply the schema
npm run db:push
```

For a deployment that should apply the committed migrations, use `npx prisma migrate deploy` instead of `db:push`.

### 5. Start the server

```bash
# Development
npm run dev

# Production
npm run build
npm start
```

## Frontend

### 1. Return to the project root

```bash
cd ..
```

### 2. Install dependencies

```bash
npm install
```

### 3. Environment file

```bash
cp .env.example .env
```

On Windows PowerShell:

```powershell
copy .env.example .env
```

Edit `.env`:

```env
# API
VITE_API_SERVER_HOST=localhost
VITE_API_SERVER_PORT=3001
VITE_API_PROTOCOL=http

# Kakao Local REST API key. Used only when map rows have an address and no coordinates.
VITE_KAKAO_REST_API_KEY=

# Internal map tile URL. Include {z}, {x}, and {y}. Leave empty to use OpenStreetMap.
# VITE_MAP_TILE_URL=https://tiles.example.go.kr/{z}/{x}/{y}.png
VITE_MAP_TILE_URL=

NODE_ENV=development
```

The 10MB upload limit is fixed in `src/utils/dataParser.ts`. It is not an environment variable.

### 4. Start the dev server

```bash
npm run dev
```

The dev server listens on port 3000.

## Database

### Install PostgreSQL

#### Windows

1. Download the installer from the [PostgreSQL site](https://www.postgresql.org/download/windows/).
2. Set a password during installation.
3. Create the database with pgAdmin or `psql`.

#### macOS

```bash
brew install postgresql
brew services start postgresql

createdb visualization_tracking
```

#### Linux (Ubuntu/Debian)

```bash
sudo apt update
sudo apt install postgresql postgresql-contrib

sudo systemctl start postgresql
sudo systemctl enable postgresql

sudo -u postgres createdb visualization_tracking
```

### Database user

```sql
CREATE USER visualization_user WITH PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE visualization_tracking TO visualization_user;
```

Put that user and password into `DATABASE_URL`. Do not commit `.env`.

## Environment variables

### IP_SALT

```bash
node -e "console.log(require('crypto').randomBytes(32).toString('hex'))"
```

Use the printed value as `IP_SALT`. Each organization generates its own value.

### Development

```env
NODE_ENV=development
LOG_LEVEL=debug
```

### Production

```env
NODE_ENV=production
LOG_LEVEL=info
```

## Run and test

### 1. Start both processes

Terminal 1, backend:

```bash
cd server
npm run dev
```

Terminal 2, frontend, from the project root:

```bash
npm run dev
```

### 2. Open the services

- **App**: http://localhost:3000
- **API**: http://localhost:3001

### 3. API checks

Start a session:

```bash
curl -X POST http://localhost:3001/api/session/start \
  -H "Content-Type: application/json" \
  -d '{
    "ua": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "client_time": "2025-01-03T10:00:00.000Z"
  }'
```

Collect events. Replace `sid` with the value returned above:

```bash
curl -X POST http://localhost:3001/api/collect \
  -H "Content-Type: application/json" \
  -d '{
    "sid": "your-session-id-here",
    "events": [{
      "category": "page",
      "name": "page_view",
      "page_path": "/test",
      "success": true,
      "payload": {},
      "client_time": "2025-01-03T10:00:00.000Z"
    }]
  }'
```

## Troubleshooting

### Database connection

```bash
sudo systemctl status postgresql

psql -h localhost -U visualization_user -d visualization_tracking
```

### Port already in use

The frontend port in this project is 3000, and the backend port is 3001.

```bash
netstat -tulpn | grep :3001
netstat -tulpn | grep :3000

kill -9 <PID>
```

On Windows PowerShell:

```powershell
netstat -ano | findstr :3001
netstat -ano | findstr :3000
```

### Dependency install failure

```bash
npm cache clean --force
rm -rf node_modules package-lock.json
npm install
```

### Prisma

```bash
npx prisma generate
npx prisma db push
```

`db push --force-reset` deletes existing tables. Use it only on a database you can recreate.

### Logs

Backend: watch the terminal where `npm run dev` is running.

Frontend: use the browser developer tools, Console and Network tabs.

### Indexes

```sql
SELECT schemaname, tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename IN ('sessions', 'events', 'files', 'charts');
```

### Memory

```bash
ps aux | grep node
ps aux | grep postgres
```

## Operations

### Routine checks

- **Daily**: review logs and errors
- **Weekly**: review database size and query time
- **Monthly**: apply security updates

This package does not include a scheduled job that deletes old sessions or events.

### Backup

```bash
pg_dump -h localhost -U visualization_user visualization_tracking > backup_$(date +%Y%m%d).sql

psql -h localhost -U visualization_user visualization_tracking < backup_20250103.sql
```

### Security review

- Rotate `IP_SALT` on your own schedule. Existing hashes will no longer match the previous salt.
- Review database grants.
- Restrict access to log files.

## Contact

- **Team**: Seocho-gu Office, Smart City Division, AI and Big Data Team
- **Phone**: 02-2155-6089
- **Email**: irize@seocho.go.kr

## License

MIT License. See `LICENSE.md`.

Plotly, Leaflet, React, and the other dependencies keep the license notices in `LICENSE.md` and in each package.
