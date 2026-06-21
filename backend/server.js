require("dotenv").config();
const express = require("express");
const cors    = require("cors");
const mongoose = require("mongoose");
const path    = require("path");

const authRoutes   = require("./routes/auth");
const cardRoutes   = require("./routes/cards");
const folderRoutes = require("./routes/folders");

const app = express();

// ── CORS ─────────────────────────────────────────────
app.use(cors({
  origin: [
    "http://localhost:3000",
    "https://sophos-1.onrender.com",   // ← your Render URL
  ],
  credentials: true,
}));

app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true }));

// ── API routes ────────────────────────────────────────
app.use("/api/auth",    authRoutes);
app.use("/api/cards",   cardRoutes);
app.use("/api/folders", folderRoutes);
app.get("/api/health",  (req, res) => res.json({ status: "ok", app: "Sophos" }));

// ── Serve React frontend in production ────────────────
if (process.env.NODE_ENV === "production") {
  // Serve static files from the React build folder
  app.use(express.static(path.join(__dirname, "../build")));

  // Any route that isn't /api/* sends back the React app
  app.get("*", (req, res) => {
    res.sendFile(path.join(__dirname, "../build", "index.html"));
  });
}

// ── MongoDB + Start ───────────────────────────────────
const PORT = process.env.PORT || 5001;

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅  MongoDB connected");
    app.listen(PORT, () => console.log(`🚀  Sophos running on port ${PORT}`));
  })
  .catch((err) => {
    console.error("MongoDB connection error:", err.message);
    process.exit(1);
  });
