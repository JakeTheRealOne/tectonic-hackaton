import path from 'node:path';
import { fileURLToPath } from 'node:url';
import dotenv from 'dotenv';
import express from 'express';
import cors from 'cors';
import { connectDatabase } from './db.js';
import { Greeting } from './models/Greeting.js';

const rootDir = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
dotenv.config({ path: path.join(rootDir, '.env') });

const app = express();
const port = Number(process.env.PORT) || 5000;

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ ok: true });
});

app.get('/api/hello', async (_req, res, next) => {
  try {
    const greeting = await Greeting.findOne({ key: 'welcome' }).lean();
    res.json({ message: greeting?.message ?? 'Hello World' });
  } catch (error) {
    next(error);
  }
});

app.use((error, _req, res, _next) => {
  console.error(error);
  res.status(500).json({ message: 'Something went wrong' });
});

async function seedGreeting() {
  await Greeting.findOneAndUpdate(
    { key: 'welcome' },
    { key: 'welcome', message: 'Hello World' },
    { upsert: true },
  );
}

const connection = await connectDatabase();
await seedGreeting();

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
  console.log(`MongoDB ready (${connection.name})`);
});
