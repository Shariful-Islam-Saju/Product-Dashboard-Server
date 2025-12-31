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
  "http://31.97.205.224:3001",
  "http://localhost:3000",
  "http://localhost:3001",
  "http://localhost:4001",
  "http://localhost:4002",
  "http://88.222.245.164:4001",
  "http://88.222.245.164:4002",
  "http://88.222.245.164:4003",
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

app.get("/", (req, res) => {
  res.send({
    Message: "Inventory App is running...",
  });
});

app.use("/api/v1", router);

app.use(globalErrorHandler);

app.use(notFound);

export default app;
