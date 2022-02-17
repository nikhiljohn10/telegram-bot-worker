require("esbuild").build({
  entryPoints: ["src/worker.ts"],
  format: "esm",
  bundle: true,
  outfile: "dist/worker.mjs",
});
