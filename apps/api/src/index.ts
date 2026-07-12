// API server entry point (DB schema pushed)
import app from "./app.js";
import { config } from "./config/index.js";

const { port, nodeEnv } = config;

const server = app.listen(port, () => {
  console.log(`=================================`);
  console.log(`  API Server running on port ${port}`);
  console.log(`  Environment: ${nodeEnv}`);
  console.log(`=================================`);
});

server.on("error", (error: NodeJS.ErrnoException) => {
  if (error.code === "EADDRINUSE") {
    console.error(`Port ${port} is already in use. Stop the existing API process or set PORT to another value.`);
    process.exit(1);
  }

  throw error;
});

function shutdown(signal: NodeJS.Signals) {
  server.close(() => {
    if (signal === "SIGUSR2") {
      process.kill(process.pid, signal);
      return;
    }

    process.exit(0);
  });
}

process.once("SIGINT", shutdown);
process.once("SIGTERM", shutdown);
process.once("SIGUSR2", shutdown);
