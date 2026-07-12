import { defineConfig } from "vitest/config";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: "node",
    globalSetup: path.resolve(__dirname, "./tests/setup/globalSetup.ts"),
    globalTeardown: path.resolve(__dirname, "./tests/setup/globalTeardown.ts"),
    setupFiles: [path.resolve(__dirname, "./tests/setup/testSetup.ts")],
    // Run tests sequentially to prevent Redis key state collisions during concurrent flushes
    sequence: {
      concurrent: false,
    },
    coverage: {
      provider: "v8",
      reporter: ["text", "json", "html"],
      include: ["src/**/*"],
      exclude: [
        "src/index.ts",
        "src/types/**",
      ],
    },
    testTimeout: 10000,
  },
});
