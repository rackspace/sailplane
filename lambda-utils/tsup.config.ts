import { defineConfig } from "tsup";

export default defineConfig({
  entry: ["lib/index.ts"],
  clean: true,
  sourcemap: true,
  format: ["cjs", "esm"],
  dts: true,
});
