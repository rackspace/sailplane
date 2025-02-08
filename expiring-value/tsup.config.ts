import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "lib/expiring-value.ts" },
  clean: true,
  sourcemap: true,
  format: ["cjs", "esm"],
  dts: true,
});
