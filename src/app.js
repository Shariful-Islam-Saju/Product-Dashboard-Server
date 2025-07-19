import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";

const app = express();

app.use(cors());
app.use(express.json());
app.use(cookieParser());

// Routes
app.get("/", (req, res) => {
  res.status(200).json({ message: "Hey, Welcome to Product Dashboard" });
});
export default app;
