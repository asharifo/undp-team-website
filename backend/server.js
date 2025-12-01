import express from "express";
import dotenv from "dotenv";
import morgan from "morgan";
import { queryCountry } from "./scripts/query.js";

dotenv.config();
const app = express();
const port = 5000;

app.use(express.json());
app.use(morgan("dev"));

app.get("/health", (_req, res) => res.send("OK"));

app.post("/api/query", async (req, res) => {
  try {
    const { question, country } = req.body || {};
    if (!question || !country) {
      return res.status(400).json({ error: "Missing 'question' or 'country'." });
    }
    const answer = await queryCountry(question, country);
    res.json({ answer });
  } catch (err) {
    console.error("API /api/query error:", err?.stack || err);
    res.status(500).json({ error: err?.message || "Internal server error" });
  }
});

app.listen(port, () => {
  console.log(`API listening on http://localhost:${port}`);
});
