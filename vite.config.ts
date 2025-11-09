import { defineConfig } from "vite";
import tailwindcss from "@tailwindcss/vite";
import topLevelAwait from "vite-plugin-top-level-await";
import wasm from "vite-plugin-wasm";
import path from "path";

export default defineConfig({
  plugins: [wasm(), topLevelAwait(), tailwindcss()],
  resolve: {
    alias: {
      "@core": path.resolve(__dirname, "src/core"),
      "@world": path.resolve(__dirname, "src/core/world"),
      "@managers": path.resolve(__dirname, "src/core/managers"),
      "@controllers": path.resolve(__dirname, "src/core/controllers"),
      "@interfaces": path.resolve(__dirname, "src/core/interfaces"),
      "@utils": path.resolve(__dirname, "src/core/utils"),
      "@constants": path.resolve(__dirname, "src/core/constants"),
      "@interactables": path.resolve(__dirname, "src/core/interactables"),
      "@store": path.resolve(__dirname, "src/core/store"),
      "@helpers": path.resolve(__dirname, "src/core/helpers"),
    },
  },
});
