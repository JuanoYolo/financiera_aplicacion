import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import tsconfigPaths from "vite-tsconfig-paths";
import { componentTagger } from "lovable-tagger";

export default defineConfig(({ mode }) => ({
  server: {
    host: "::",
    port: 8080,
  },
  plugins: [
    react(),
    tsconfigPaths(),              // <- Resuelve @/* según tsconfig.paths
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      // Alias manual, por si acaso:
      "@": path.resolve(__dirname, "src"),
      // Si quieres atajos extra:
      "@components": path.resolve(__dirname, "src/components"),
      "@layout":     path.resolve(__dirname, "src/components/layout"),
      "@hooks":      path.resolve(__dirname, "src/hooks"),
      "@utils":      path.resolve(__dirname, "src/utils"),
    },
    // Extensiones que Vite tratará de resolver automáticamente
    extensions: [".js", ".ts", ".jsx", ".tsx", ".json"],
  },
}));
