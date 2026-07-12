// API server entry point (DB schema pushed)
import app from "./app.js";
import { config } from "./config/index.js";

const { port, nodeEnv } = config;

app.listen(port, () => {
  console.log(`=================================`);
  console.log(`  API Server running on port ${port}`);
  console.log(`  Environment: ${nodeEnv}`);
  console.log(`=================================`);
});
