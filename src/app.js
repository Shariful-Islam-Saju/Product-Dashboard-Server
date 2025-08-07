import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import axios from "axios";

// Route imports
import productRouter from "./routes/product-dashboard.js";
import authRouter from "./routes/auth.js";
import { protectedRoute } from "./middlewares/protected-routes.js";
import { verifyJwt } from "./utils/verifyJwt.js";

const app = express();

// Middleware
// Middleware
const corsOptions = {
  origin: true, // Reflect the request origin in the CORS headers
  credentials: true, // Allow cookies and credentials
};

app.use(cors(corsOptions));

app.use(express.json());
app.use(cookieParser());

// Log Request
app.use((req, res, next) => {

  console.log(`[${new Date().toISOString()}] ${req.method} ${req.originalUrl}`);
  next();
});

// Health check route

app.get("/", (req, res) => {
  res.status(200).json({ message: "✅ Product Dashboard API is running." });
});

// Verify JWT
app.get("/api/verify-jwt", protectedRoute, verifyJwt);

// Auth routes
app.use("/api/auth", authRouter);

// Product dashboard routes (should be protected with auth middleware)
app.use("/api/product-dashboard", protectedRoute, productRouter);

// See Render IP

app.get("/my-ip", async (req, res) => {
  const response = await axios.get("https://api.ipify.org?format=json");
  res.send(`Public IP: ${response.data.ip}`);
});

app.listen(3000, () => console.log("Running"));

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
