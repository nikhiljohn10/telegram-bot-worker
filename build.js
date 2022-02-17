require("esbuild").build({
  entryPoints: ["src/worker.ts"],
  format: "esm",
  bundle: true,
  minify: true,
  outfile: "dist/worker.mjs",
});
