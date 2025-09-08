import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import globalErrorHandler from "./app/middlewares/globalErrorHandler.js";
import router from "./app/routes/index.js";
// import config from "./app/config/index.js";
import notFound from "./app/middlewares/notFound.js";

const app = express();

app.use(cookieParser());

const allowedOrigins = [
  "https://report.unipharma.store",
  "https://product-dashboard-kappa-five.vercel.app",
  "http://localhost:3000",
  "http://localhost:3001",
];

const corsOptions = {
  origin: function (origin, callback) {
    if (!origin) return callback(null, true); // Allow requests with no origin (like mobile apps)

    if (allowedOrigins.indexOf(origin) !== -1) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  optionsSuccessStatus: 200,
};

app.use(cors(corsOptions));
// parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.get("/api/v1", (req, res) => {
  res.send({
    Message: "Inventory App is running...",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
