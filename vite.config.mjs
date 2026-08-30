import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import { normalizeBase } from "./src/base-path.mjs";

export default defineConfig({
  base: normalizeBase(process.env.PAGES_BASE_PATH || "/"),
  build: {
    outDir: "dist",
  },
  optimizeDeps: {
    include: ["react", "react-dom/client"],
  },
  server: {
    host: "0.0.0.0",
    allowedHosts: ["terminal.local"],
    warmup: {
      clientFiles: ["./src/main.jsx"],
    },
  },
  plugins: [react()],
});
