# Frontend admin

This project uses React, TypeScript, and Vite. The browser reads its API URL from `/config.js` when the app starts. The URL is supplied by the frontend server at runtime, so one build can be deployed with different API URLs.

## Run locally

Install dependencies with `npm ci`, then set the backend URL in the shell that starts the frontend:

```powershell
$env:API_BASE_URL = 'http://localhost:8080'
npm run dev
```

You can use `$env:VITE_API_BASE_URL` instead. For `npm run dev`, Vite also reads `VITE_API_BASE_URL` from `.env`.

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

Set `API_BASE_URL` or `VITE_API_BASE_URL` as an environment variable on the process running `npm start`. If both are set, `API_BASE_URL` takes precedence. `PORT` is optional and defaults to `4173`. Change the URL by restarting the server with a different environment value; no rebuild is needed. `npm start` reads process environment variables, not `.env`; `npm run preview` also runs this server.

The browser loads `/config.js` before loading the app. `npm run build` does not write a URL into `dist`; the runtime server generates `/config.js` from its environment. A static host needs to generate or serve that file when it starts. The backend must allow the frontend origin through CORS when they are on different origins.

## Docker

Build `dist` first, then build the image. Pass the API URL when starting the container:

```sh
npm ci
npm run build
docker build -t frontend-admin .
docker run --rm -p 8080:80 -e API_BASE_URL=https://api.example.com frontend-admin
```

The same image can run with another `API_BASE_URL` without rebuilding it. The container serves port 80.
