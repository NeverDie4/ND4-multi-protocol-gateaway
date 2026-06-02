import path from "path"
import { defineConfig } from "vite"
import react from "@vitejs/plugin-react"
import tailwindcss from "@tailwindcss/vite"
import { dynamicBase } from "vite-plugin-dynamic-base"

export default defineConfig({
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "src"),
    },
  },
  plugins: [
    tailwindcss(),
    react(),
    dynamicBase({
      publicPath: "window.__dynamic_base__",
      transformIndexHtml: true,
    }),
  ],
  base: process.env.NODE_ENV === "production" ? "/__dynamic_base__/" : "/",
  build: {
    outDir: "../public/dist",
    emptyOutDir: true,
  },
  server: {
    host: "0.0.0.0",
    proxy: {
      "/api": {
        target: "http://localhost:5244",
        changeOrigin: true,
      },
    },
  },
})
