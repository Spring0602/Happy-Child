import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import { aiRouter } from "./routes/ai";

dotenv.config();

const app = express();

app.use(cors());
app.use(express.json({ limit: "1mb" }));

app.get("/health", (_req, res) => {
  res.json({ ok: true, service: "happy-child-ai-server" });
});

app.use("/api", aiRouter);

const port = Number(process.env.PORT ?? 3001);

app.listen(port, () => {
  console.log(`AI server running at http://localhost:${port}`);
});
