# Tectonic hackaton

Bilal, Baptiste, Petro, Stas (BelgianEast raaaah)

---

## MERN Hello World

Minimal MERN stack app that displays **Hello World** from MongoDB through an Express API to a React frontend.

### Stack

- **M**ongoDB (in-memory by default, or set `MONGO_URI`)
- **E**xpress
- **R**eact (Vite)
- **N**ode.js

### Quick start

```bash
npm install
npm run install:all
npm start
```

Then open [http://localhost:3000](http://localhost:3000).

- Frontend: `http://localhost:3000`
- Backend API: `http://localhost:5000/api/hello`

### Optional: real MongoDB

```bash
MONGO_URI=mongodb://127.0.0.1:27017/mern-hello npm run server
```

Without `MONGO_URI`, the server starts an in-memory MongoDB so the app runs with zero local DB setup.

### Scripts

| Command | Description |
| --- | --- |
| `npm start` / `npm run dev` | Run API + React together |
| `npm run server` | API only (port 5000) |
| `npm run client` | React only (port 3000) |
| `npm run build` | Production build of the client |
