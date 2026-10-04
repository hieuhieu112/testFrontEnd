# Frontend admin

This project uses React, TypeScript, and Vite.

## Run locally

Install dependencies with `npm ci`, then set the backend URL in the shell that starts the frontend:

```powershell
$env:API_BASE_URL = 'http://localhost:8080'
npm run dev
```

On macOS or Linux:

```sh
API_BASE_URL=http://localhost:8080 npm run dev
```

The URL must start with `http://` or `https://`. Include a path prefix if the backend uses one. API requests append `/api/...` to this URL.

## Deploy

```sh
npm ci
npm run build
API_BASE_URL=https://api.example.com PORT=4173 npm start
```

In PowerShell, after building:

```powershell
$env:API_BASE_URL = 'https://api.example.com'
$env:PORT = '4173'
npm start
```

Set `API_BASE_URL` as an environment variable on the process running `npm start`. `PORT` is optional and defaults to `4173`. The same `dist` build can be used with different backend URLs by restarting the server with a different `API_BASE_URL`. No `.env` file or rebuild is needed. `npm run preview` also runs this server.

The browser loads `/config.js` from the frontend server before loading the app. If deploying `dist` to another static host instead of using `npm start`, that host must serve `/config.js` with `window.__APP_CONFIG__ = { apiBaseUrl: "https://api.example.com" };` before the app loads. The backend must allow the frontend origin through CORS when they are on different origins.
