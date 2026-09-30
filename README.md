# Tectonic hackaton

Bilal, Baptiste, Petro, Stas (BelgianEast raaaah)

Blank MERN app. The React page loads **Hello World** from MongoDB through an Express API.

## Run locally

Requires Node.js 20 or newer.

```bash
npm install
npm run dev
```

- Web: http://localhost:5173
- API: http://localhost:5000/api/hello

With no `MONGODB_URI`, the API starts an in-memory MongoDB and stores a Hello World greeting. To use your own database, copy `.env.example` to `.env` and set `MONGODB_URI`.

## Layout

- `client/` — React (Vite)
- `server/` — Express and Mongoose
