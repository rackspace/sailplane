import { defineConfig } from "tsup";

export default defineConfig({
  entry: { index: "lib/aws-https.ts" },
  clean: true,
  sourcemap: true,
  format: ["cjs", "esm"],
  dts: true,
});
