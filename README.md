# AI Blog Hub

## Setup

Install dependencies for each app:

```sh
npm install
npm install --prefix backend
npm install --prefix frontend
```

Copy `backend/.env.example` to `backend/.env` and set the values you need. Keep
`backend/.env` private; it is excluded from Git.

## Run locally

Start the Vite frontend with `npm run dev` and the Express API in a second
terminal with `npm run dev:backend`. The API defaults to port 5000 and exposes
`POST /api/auth/register`.

Use `npm start` to run only the backend, `npm run build` to build the frontend,
and `npm run lint` to lint it. Run backend tests with
`npm test --prefix backend`.
