import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

// Route imports
import productRouter from "./routes/product-dashboard.js";
import authRouter from "./routes/auth.js";

const app = express();

// Middleware
app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Health check route
app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Product Dashboard API is running." });
});

// Auth routes
app.use("/api/auth", authRouter);

// Product dashboard routes (should be protected with auth middleware)
app.use("/api/product-dashboard", productRouter);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({ error: "Route not found" });
});

// Global Error Handler (optional)
app.use((err, req, res, next) => {
  console.error(" Server Error:", err);
  res.status(500).json({ error: "Internal Server Error" });
});

export default app;
