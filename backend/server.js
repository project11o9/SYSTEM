const express = require("express");
const cors = require("cors");

const authRoutes = require("./routes/auth");
const { pool, initializeDatabase } = require("./config/db");

const app = express();
const PORT = process.env.PORT || 10000;

/* ===== CORS ===== */
app.use(
  cors({
    origin: process.env.CORS_ORIGIN || "*", // allow all for now (fix later)
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);

/* ===== MIDDLEWARE ===== */
app.use(express.json());

/* ===== HEALTH CHECK ===== */
app.get("/api/health", async (_req, res) => {
  try {
    await pool.query("SELECT 1");
    res.json({ success: true, message: "API running" });
  } catch (err) {
    console.error("Health check failed:", err);
    res.status(500).json({ success: false, message: "Database unavailable" });
  }
});

/* ===== ROUTES ===== */
app.use("/api/auth", authRoutes);

/* ===== 404 HANDLER ===== */
app.use((_req, res) => {
  res.status(404).json({ success: false, message: "Route not found" });
});

/* ===== START SERVER ===== */
(async () => {
  try {
    await initializeDatabase();

    app.listen(PORT, () => {
      console.log(`🚀 Server running on port ${PORT}`);
    });
  } catch (err) {
    console.error("❌ Failed to initialize server:", err);
    process.exit(1);
  }
})();
