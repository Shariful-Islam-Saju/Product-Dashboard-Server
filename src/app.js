import express from "express";
import cors from "cors";
import httpStatus from "http-status";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/errors/globalErrorHandler.js";
import router from "./app/routes/index.js";
import config from "./app/config/index.js";

const app = express();

app.use(cookieParser());
app.use(cors({ origin: config.client_uri, credentials: true }));

// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/", (req, res) => {
  res.send({
    Message: "Inventory App is running...",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use((req, res, next) => {
  res.status(httpStatus.NOT_FOUND).json({
    success: false,
    message: "API NOT FOUND!",
    error: {
      path: req.originalUrl,
      message: "Your requested path is not found!",
    },
  });
});

export default app;
