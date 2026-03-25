import path from "path"
import tailwindcss from "@tailwindcss/vite"
import react from "@vitejs/plugin-react"
import { defineConfig } from "vite"

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react({
      babel: {
        plugins: ["babel-plugin-react-compiler"],
      },
    }),
    tailwindcss(),
  ],
  server: {
    proxy: {
      "/api": {
        target: "http://localhost:3000",
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api/, ""),
      },
    },
  },
  build: {
    chunkSizeWarningLimit: 650,
    rollupOptions: {
      output: {
        manualChunks(id) {
          const normalizedId = id.replace(/\\/g, "/")

          if (!normalizedId.includes("node_modules")) {
            return
          }

          if (normalizedId.includes("@ant-design/x-markdown")) {
            return "x-markdown-vendor"
          }

          if (
            normalizedId.includes("marked") ||
            normalizedId.includes("dompurify") ||
            normalizedId.includes("html-react-parser") ||
            normalizedId.includes("katex")
          ) {
            return "markdown-parser-vendor"
          }

          if (
            normalizedId.includes("react-pdf") ||
            normalizedId.includes("pdfjs-dist")
          ) {
            return "pdf-preview-vendor"
          }

          if (normalizedId.includes("jszip")) {
            return "jszip-vendor"
          }

          if (normalizedId.includes("mammoth")) {
            return "docx-preview-vendor"
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
})
