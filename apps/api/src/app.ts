import express from "express";
import cors from "cors";
import { config } from "./config/index.js";
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

// Body parsers
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple request logger middleware
app.use((req, res, next) => {
  console.log(`[Request] ${req.method} ${req.path}`);
  next();
});

// API Router namespaces
app.use("/api/v1", routes);

// Centralized error handling
app.use(errorHandler);

export default app;
