import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "lib/elasticsearch-client.ts" },
  clean: true,
  sourcemap: true,
  format: ["cjs", "esm"],
  dts: true,
});
