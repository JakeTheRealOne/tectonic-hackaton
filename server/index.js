import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const messageSchema = new mongoose.Schema(
  {
    text: { type: String, required: true },
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

async function connectDatabase() {
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    return;
  }

  const memoryServer = await MongoMemoryServer.create();
  const uri = memoryServer.getUri();
  await mongoose.connect(uri);
  console.log("Connected to in-memory MongoDB (set MONGO_URI to use a real instance)");
}

async function seedHelloWorld() {
  const existing = await Message.findOne({ text: "Hello World" });
  if (!existing) {
    await Message.create({ text: "Hello World" });
  }
}

async function start() {
  await connectDatabase();
  await seedHelloWorld();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/hello", async (_req, res) => {
    try {
      const message = await Message.findOne().sort({ createdAt: 1 });
      res.json({ message: message?.text ?? "Hello World" });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch message" });
    }
  });

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
