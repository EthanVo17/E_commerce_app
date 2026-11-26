import "dotenv/config";

import express from "express";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";

import RootRoute from "./routes/RootRoute.js";
import connectDB from "./config/database.js";
import UserModel from "./models/User.model.js";
import RefreshTokenModel from "./models/RefreshToken.model.js";
import { ErrorHandler } from "./middlewares/ErrorHandler.js";

const app: express.Express = express();

const port = Number(process.env.PORT ?? 3000);
// FRONTEND_URL may contain a comma-separated list when the app is deployed.
// Strip wrapping quotes and trailing semicolons so common .env formatting does
// not make an otherwise-correct origin fail the exact CORS comparison.
const frontendURLs = (process.env.FRONTEND_URL ?? "http://localhost:5173")
  .split(",")
  .map((url) => url.trim().replace(/^['\"]|['\"]$/g, ""))
  .filter(Boolean);

const isDev = process.env.NODE_ENV !== "production";
const isLocalhost = /^https?:\/\/(localhost|127\.0\.0\.1)(:\d+)?$/;
const corsOptions = {
  origin: (
    origin: string | undefined,
    callback: (error: Error | null, allowed?: boolean) => void,
  ) => {
    if (!origin || frontendURLs.includes(origin)) return callback(null, true);
    if (isDev && isLocalhost.test(origin)) {
      return callback(null, true);
    }
    return callback(new Error(`Origin ${origin} is not allowed by CORS`));
  },

  credentials: true,

  methods: ["GET", "POST", "PUT", "PATCH", "DELETE"],

  allowedHeaders: ["Content-Type", "Authorization"],
};

app.use(cors(corsOptions));
app.use(
  helmet.contentSecurityPolicy({
    directives: {
      defaultSrc: ["'self'"],
      connectSrc: ["'self'", ...frontendURLs],
      // reportUri: "/api/csp-violation-report",
    },
    reportOnly: true,
  }),
);

app.use(morgan("dev"));
app.use(express.json({ limit: "16kb" }));
app.use(express.urlencoded({ extended: true, limit: "16kb" }));
app.use(cookieParser());
app.use(express.static("public"));

RootRoute(app);

app.use(ErrorHandler);

async function Start() {
  connectDB();

  await UserModel.createIndexes();
  await RefreshTokenModel.createIndexes();

  app.listen(port, () => {
    console.log(`[server]: Backend đang chạy tại http://localhost:${port}`);
  });
}

Start();
