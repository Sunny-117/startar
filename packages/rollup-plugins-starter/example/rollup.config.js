import { defineConfig } from "rollup";
export default defineConfig({
  input: "./index.js",
  output: {
    file: "./dist/index.js",
    format: "es",
  },
  plugins: [
    // write your plugins
  ],
});
