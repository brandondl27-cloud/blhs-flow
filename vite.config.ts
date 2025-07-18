import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";

export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./client/src"),
      "@shared": path.resolve(__dirname, "./shared"),
    },
  },
  root: "./client",
  build: {
    outDir: "../dist/public",
    emptyOutDir: true,
    rollupOptions: {
      external: [
        "drizzle-orm",
        "drizzle-orm/pg-core",
        "@neondatabase/serverless",
        "drizzle-kit",
        "drizzle-zod"
      ]
    }
  },
});
