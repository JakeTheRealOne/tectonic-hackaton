import cors from "cors";
import express from "express";
import mongoose from "mongoose";
import multer from "multer";
import { MongoMemoryServer } from "mongodb-memory-server";

const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI;

const LOREM_IPSUM =
  "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.";

const messageSchema = new mongoose.Schema(
  {
    role: { type: String, enum: ["user", "assistant"], required: true },
    text: { type: String, default: "" },
    files: [
      {
        originalName: String,
        mimeType: String,
        size: Number,
      },
    ],
  },
  { timestamps: true }
);

const Message = mongoose.model("Message", messageSchema);

const upload = multer({
  storage: multer.memoryStorage(),
  limits: { fileSize: 5 * 1024 * 1024, files: 5 },
});

async function connectDatabase() {
  if (MONGO_URI) {
    await mongoose.connect(MONGO_URI);
    console.log("Connected to MongoDB");
    return;
  }

  const memoryServer = await MongoMemoryServer.create();
  await mongoose.connect(memoryServer.getUri());
  console.log("Connected to in-memory MongoDB (set MONGO_URI to use a real instance)");
}

async function start() {
  await connectDatabase();

  const app = express();
  app.use(cors());
  app.use(express.json());

  app.get("/api/health", (_req, res) => {
    res.json({ status: "ok" });
  });

  app.get("/api/messages", async (_req, res) => {
    try {
      const messages = await Message.find().sort({ createdAt: 1 }).lean();
      res.json({ messages });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to fetch messages" });
    }
  });

  app.post("/api/chat", upload.array("files", 5), async (req, res) => {
    try {
      const text = typeof req.body.text === "string" ? req.body.text.trim() : "";
      const files = (req.files || []).map((file) => ({
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
      }));

      if (!text && files.length === 0) {
        return res.status(400).json({ error: "Message text or file is required" });
      }

      const userMessage = await Message.create({
        role: "user",
        text,
        files,
      });

      const assistantMessage = await Message.create({
        role: "assistant",
        text: LOREM_IPSUM,
        files: [],
      });

      res.status(201).json({
        userMessage,
        assistantMessage,
      });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to send message" });
    }
  });

  app.delete("/api/messages", async (_req, res) => {
    try {
      await Message.deleteMany({});
      res.json({ ok: true });
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Failed to clear messages" });
    }
  });

  app.listen(PORT, () => {
    console.log(`Server listening on http://localhost:${PORT}`);
  });
}

start().catch((error) => {
  console.error("Failed to start server:", error);
  process.exit(1);
});
