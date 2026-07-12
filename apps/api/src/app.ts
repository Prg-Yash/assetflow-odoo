import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
import authRouter from "./routes/auth.route.js";
import routes from "./routes/index.js";
import { errorHandler } from "./middleware/error.middleware.js";

const app = express();

// Enable CORS with credentials support for session cookies
app.use(
  cors({
    origin: config.corsOrigin,
    credentials: true,
  })
);

// Better Auth needs direct access to the request stream, so mount it before body parsers.
app.use("/api/v1/auth", authRouter);

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

// Root landing page / status check
app.get("/", (req, res) => {
  res.status(200).json({
    success: true,
    service: "AssetFlow Enterprise API Server",
    version: "1.0.0",
    status: "ONLINE",
    documentation: "All API endpoints are mounted under /api/v1",
    healthCheck: "/api/v1/health",
  });
});

// API Router namespaces
app.use("/api/v1", routes);

// Centralized error handling
app.use(errorHandler);

export default app;
