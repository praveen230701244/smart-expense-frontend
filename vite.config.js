import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 3000,
    strictPort: true
  },
  esbuild: {
    // Allow JSX inside .js files under src (keeps the requested file layout).
    loader: "jsx",
    include: /src\/.*\.js$/
  }
});

