import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
export default defineConfig({
  root: "pages",
  base: "/onetinyrevision/",
  publicDir: "../public",
  plugins: [react()],
  css: { postcss: { plugins: [] } },
  build: { outDir: "../dist/pages", emptyOutDir: true },
});
